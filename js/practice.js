import { saveSessionOnline } from './firebase-service.js';
import { createNumberOptions } from './core/answer-options.js';
import { generateQuestion } from './core/question-router.js';
import { buildSessionResult, createDefaultPracticeState, normalizeWrongQuestion, percent } from './core/score.js';

(function(){
  const params = new URLSearchParams(location.search);
  const lessons = window.LESSONS || [];
  const reviewMode = params.get('review');

  const el = {
    subtitle: document.getElementById('lessonSubtitle'),
    title: document.getElementById('lessonTitle'),
    currentNo: document.getElementById('currentNo'),
    totalNo: document.getElementById('totalNo'),
    right: document.getElementById('rightCount'),
    wrong: document.getElementById('wrongCount'),
    expression: document.getElementById('expression'),
    grid: document.getElementById('answerGrid'),
    feedback: document.getElementById('feedback'),
    questionCard: document.getElementById('questionCard'),
    reviewCard: document.getElementById('reviewCard'),
    hintBtn: document.getElementById('hintBtn'),
    resetBtn: document.getElementById('resetBtn'),
    audioDung: document.getElementById('audioDung'),
    audioSai: document.getElementById('audioSai')
  };

  let lesson = null;
  let key = '';
  let total = 10;
  let state = null;
  let currentQuestion = null;
  let answered = false;
  let mode = 'normal';
  let source = '';
  let reviewQuestions = [];

  function init(){
    if(reviewMode){
      initWrongReview(reviewMode);
    } else {
      initNormalPractice();
    }
    bindControls();
    loadNextQuestion();
  }

  function initNormalPractice(){
    const lessonId = params.get('lesson') || (lessons[0] && lessons[0].id);
    lesson = lessons.find(l => l.id === lessonId) || lessons[0];
    if(!lesson){
      showFatal('Chưa có bài học', 'Bạn kiểm tra lại data/lessons.js.');
      return;
    }
    mode = 'normal';
    source = '';
    total = Number(lesson.totalQuestions || lesson.total || 10);
    key = 'study_' + lesson.id;
    state = loadState(key, createDefaultPracticeState({ total }));
  }

  function initWrongReview(reviewType){
    mode = 'review-wrong';
    source = reviewType === 'session' ? 'history-session' : 'last-session';
    reviewQuestions = reviewType === 'session'
      ? StudyStorage.getReviewWrongQuestions()
      : StudyStorage.getLastWrongQuestions();
    reviewQuestions = StudyStorage.normalizeWrongQuestions(reviewQuestions);

    if(!reviewQuestions.length){
      showNoWrongQuestions();
      return;
    }

    const first = reviewQuestions[0];
    lesson = {
      id: first.lessonId || 'review-wrong',
      title: 'Ôn câu sai',
      grade: first.grade,
      topic: first.topic || 'Ôn câu sai',
      skill: first.skill || 'Ôn câu sai',
      level: first.level || 'easy',
      totalQuestions: reviewQuestions.length,
      config: { allowNegative: false }
    };
    total = reviewQuestions.length;
    key = 'review_wrong_' + reviewType;
    state = createDefaultPracticeState({ total, reviewIndex: 0, wrongList: [] });
    localStorage.removeItem(key);
  }

  function loadState(storageKey, fallback){
    try { return JSON.parse(localStorage.getItem(storageKey)) || fallback; }
    catch(e){ return fallback; }
  }

  function saveState(){
    if(key && state) localStorage.setItem(key, JSON.stringify(state));
  }

  function reset(){
    if(key) localStorage.removeItem(key);
    if(mode === 'review-wrong'){
      state = createDefaultPracticeState({ total, reviewIndex: 0, wrongList: [] });
    } else {
      state = createDefaultPracticeState({ total });
    }
    loadNextQuestion();
  }

  function bindControls(){
    el.hintBtn.onclick = showHint;
    el.resetBtn.onclick = reset;
  }

  function updateStatus(){
    if(!state) return;
    el.currentNo.textContent = Math.min(state.current, total);
    el.totalNo.textContent = total;
    el.right.textContent = state.right;
    el.wrong.textContent = state.wrong;
  }

  function loadNextQuestion(){
    if(!state || !lesson) return;
    if(state.current > total){ showReview(); return; }
    answered = false;
    currentQuestion = mode === 'review-wrong' ? getReviewQuestion() : getNormalQuestion();
    if(!currentQuestion) return;

    renderQuestion();
    updateStatus();
  }

  function getNormalQuestion(){
    try {
      return generateQuestion(lesson);
    } catch (error) {
      showFatal('Chưa sinh được câu hỏi', error.message);
      return null;
    }
  }

  function getReviewQuestion(){
    const item = reviewQuestions[state.current - 1];
    if(!item) return null;
    return {
      questionText: item.questionText,
      answer: item.answer,
      type: item.type || 'review-wrong',
      topic: item.topic,
      skill: item.skill,
      level: item.level,
      explanation: item.explanation || '',
      originalWrong: item
    };
  }

  function renderQuestion(){
    const titlePrefix = mode === 'review-wrong' ? 'Đang ôn câu sai · ' : '';
    el.subtitle.textContent = mode === 'review-wrong'
      ? `Đang ôn câu sai · ${total} câu cần luyện lại`
      : `${lesson.title} · ${total} câu/lượt`;
    el.title.textContent = titlePrefix + (mode === 'review-wrong' ? 'Cố gắng sửa từng câu nhé!' : lesson.title);
    el.expression.textContent = currentQuestion.questionText.includes('=') ? currentQuestion.questionText : currentQuestion.questionText + ' = ?';
    el.feedback.textContent = '';
    el.feedback.classList.remove('bad', 'good');
    el.grid.innerHTML = '';

    const options = createNumberOptions(currentQuestion.answer, {
      count: 4,
      allowNegative: Boolean(lesson.config && lesson.config.allowNegative)
    });

    options.forEach(value => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = value;
      btn.onclick = () => handleAnswer(value, btn);
      el.grid.appendChild(btn);
    });

    el.questionCard.classList.remove('hidden');
    el.reviewCard.classList.add('hidden');
  }

  function handleAnswer(value, btn){
    if(answered) return;
    answered = true;
    const isCorrect = Number(value) === Number(currentQuestion.answer);

    if(isCorrect){
      state.right++;
      btn.classList.add('correct');
      el.feedback.textContent = mode === 'review-wrong'
        ? 'Tốt lắm, con đã sửa được câu này!'
        : 'Đúng rồi! Giỏi lắm con!';
      el.feedback.classList.remove('bad');
      el.feedback.classList.add('good');
      play(el.audioDung);
    } else {
      state.wrong++;
      btn.classList.add('wrong');
      el.feedback.textContent = buildWrongFeedback();
      el.feedback.classList.add('bad');
      saveWrongQuestion(value);
      markCorrectAnswer();
      play(el.audioSai);
    }

    saveState();
    updateStatus();
    setTimeout(() => { state.current++; saveState(); loadNextQuestion(); }, 1600);
  }

  function buildWrongFeedback(){
    const correct = currentQuestion.answer;
    const explanation = currentQuestion.explanation ? ' ' + currentQuestion.explanation : '';
    return mode === 'review-wrong'
      ? `Chưa sao, đáp án đúng là ${correct}.${explanation}`
      : 'Chưa đúng rồi, con xem lại nhé!';
  }

  function saveWrongQuestion(userAnswer){
    const base = currentQuestion.originalWrong || currentQuestion;
    state.wrongList.push(normalizeWrongQuestion({
      ...base,
      questionText: currentQuestion.questionText,
      answer: Number(currentQuestion.answer),
      userAnswer: Number(userAnswer),
      lessonId: base.lessonId || lesson.id,
      lessonTitle: base.lessonTitle || lesson.title,
      grade: base.grade ?? lesson.grade,
      topic: base.topic || currentQuestion.topic || lesson.topic,
      skill: base.skill || currentQuestion.skill || lesson.skill,
      level: base.level || lesson.level,
      type: currentQuestion.type,
      explanation: currentQuestion.explanation || base.explanation || '',
      createdAt: new Date().toISOString()
    }, lesson));
  }

  function markCorrectAnswer(){
    [...el.grid.children].forEach(child => {
      if(Number(child.textContent) === Number(currentQuestion.answer)) child.classList.add('correct');
    });
  }

  function play(audio){
    try { audio.currentTime = 0; audio.play(); } catch(e) {}
  }

  function showHint(){
    if(!currentQuestion || answered) return;
    el.feedback.textContent = currentQuestion.explanation || ('Gợi ý: Đáp án đúng là ' + currentQuestion.answer);
    el.feedback.classList.remove('bad');
  }

  async function finishSession(){
    const sessionData = buildSessionResult({ lesson, state, mode, source });

    if(mode === 'normal'){
      saveLastWrongQuestions(sessionData.wrongQuestions);
    }

    try {
      const onlineId = await saveSessionOnline(sessionData);
      state.saveMessage = '✅ Kết quả đã lưu ONLINE vào Firebase.';
      StudyStorage.saveSession({ ...sessionData, onlineId, saveMode: 'online-backup' });
    } catch (error) {
      StudyStorage.saveSession({ ...sessionData, saveMode: 'local-fallback', firebaseError: error.message });
      state.saveMessage = '⚠️ Firebase chưa lưu được. Kết quả đang lưu tạm trên máy này. Lỗi: ' + error.message;
      console.error('Firebase save failed:', error);
    }

    if(mode === 'review-wrong'){
      StudyStorage.clearReviewWrongQuestions();
    }
    if(key) localStorage.removeItem(key);
  }

  function saveLastWrongQuestions(wrongQuestions){
    StudyStorage.saveLastWrongQuestions(wrongQuestions || []);
  }

  async function showReview(){
    if(!state.saved){
      state.saved = true;
      saveState();
      el.questionCard.classList.add('hidden');
      el.reviewCard.classList.remove('hidden');
      el.reviewCard.innerHTML = `<h2>Đang lưu kết quả...</h2><p style="text-align:center">Hệ thống đang lưu kết quả học của con.</p>`;
      await finishSession();
    }

    el.questionCard.classList.add('hidden');
    el.reviewCard.classList.remove('hidden');
    const resultPercent = percent(state.right, total);
    const wrongHtml = state.wrongList.length ? renderWrongList() : renderNoWrong();
    const reviewButton = mode === 'normal' && state.wrongList.length
      ? `<button class="btn" id="reviewWrongBtn">Ôn lại câu sai</button>`
      : '';

    el.reviewCard.innerHTML = `
      <h2>${mode === 'review-wrong' ? 'Kết quả ôn câu sai' : 'Kết quả lượt học'}</h2>
      <p class="save-message">${escapeHtml(state.saveMessage || '')}</p>
      <p style="text-align:center;font-size:22px">Con làm đúng <strong>${state.right}/${total}</strong> câu (${resultPercent}%).</p>
      ${wrongHtml}
      <div class="controls">
        ${reviewButton}
        <button class="btn" id="newRoundBtn">${mode === 'review-wrong' ? 'Ôn lại lần nữa' : 'Làm lượt mới'}</button>
        <button class="btn secondary" id="historyBtn">Xem lịch sử học</button>
      </div>`;

    const reviewBtn = document.getElementById('reviewWrongBtn');
    if(reviewBtn){ reviewBtn.onclick = () => { location.href = 'practice.html?review=last'; }; }
    document.getElementById('newRoundBtn').onclick = reset;
    document.getElementById('historyBtn').onclick = () => { location.href = 'history.html'; };
  }

  function renderWrongList(){
    return `<p>Các câu con cần ôn lại:</p><ol class="review-list">${state.wrongList.map(item => `
      <li>${escapeHtml(item.questionText)} = <strong>${escapeHtml(String(item.answer))}</strong>
      <span style="color:#c83911">(con chọn ${escapeHtml(String(item.userAnswer))})</span>
      ${item.explanation ? `<em>${escapeHtml(item.explanation)}</em>` : ''}</li>`).join('')}</ol>`;
  }

  function renderNoWrong(){
    return `<p style="text-align:center;font-size:22px;color:#12823b"><strong>${mode === 'review-wrong' ? 'Rất tốt! Con đã ôn xong.' : 'Xuất sắc! Con không sai câu nào.'}</strong></p>`;
  }

  function showNoWrongQuestions(){
    el.questionCard.classList.add('hidden');
    el.reviewCard.classList.remove('hidden');
    el.reviewCard.innerHTML = `
      <h2>Con chưa có câu sai nào để ôn. Rất tốt!</h2>
      <div class="controls">
        <a class="btn" href="index.html">Về trang chọn bài</a>
        <a class="btn secondary" href="history.html">Xem lịch sử học</a>
      </div>`;
  }

  function showFatal(title, message){
    el.questionCard.classList.add('hidden');
    el.reviewCard.classList.remove('hidden');
    el.reviewCard.innerHTML = `<h2>${escapeHtml(title)}</h2><p style="text-align:center;color:#c83911">${escapeHtml(message)}</p>`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  init();
})();
