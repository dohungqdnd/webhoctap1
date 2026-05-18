import { saveSessionOnline } from './firebase-service.js';
import { createNumberOptions } from './core/answer-options.js';
import { generateQuestion } from './core/question-router.js';
import { buildSessionResult, createDefaultPracticeState, percent } from './core/score.js';

(function(){
  const params = new URLSearchParams(location.search);
  const lessons = window.LESSONS || [];
  const lessonId = params.get('lesson') || (lessons[0] && lessons[0].id);
  const lesson = lessons.find(l => l.id === lessonId) || lessons[0];
  const key = 'study_' + lesson.id;
  const total = Number(lesson.totalQuestions || lesson.total || 10);

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

  let state = loadState();
  let currentQuestion = null;
  let answered = false;

  function defaultState(){ return createDefaultPracticeState(); }
  function loadState(){
    try { return JSON.parse(localStorage.getItem(key)) || defaultState(); }
    catch(e){ return defaultState(); }
  }
  function saveState(){ localStorage.setItem(key, JSON.stringify(state)); }
  function reset(){ localStorage.removeItem(key); state = defaultState(); startQuestion(); }

  function updateStatus(){
    el.currentNo.textContent = Math.min(state.current, total);
    el.totalNo.textContent = total;
    el.right.textContent = state.right;
    el.wrong.textContent = state.wrong;
  }

  function startQuestion(){
    if(state.current > total){ showReview(); return; }
    answered = false;
    try {
      currentQuestion = generateQuestion(lesson);
    } catch (error) {
      el.questionCard.classList.add('hidden');
      el.reviewCard.classList.remove('hidden');
      el.reviewCard.innerHTML = `<h2>Chưa sinh được câu hỏi</h2><p style="text-align:center;color:#c83911">${escapeHtml(error.message)}</p>`;
      return;
    }

    el.subtitle.textContent = `${lesson.title} · ${total} câu/lượt`;
    el.title.textContent = lesson.title;
    el.expression.textContent = currentQuestion.questionText.includes('=') ? currentQuestion.questionText : currentQuestion.questionText + ' = ?';
    el.feedback.textContent = '';
    el.feedback.classList.remove('bad');
    el.grid.innerHTML = '';

    const options = createNumberOptions(currentQuestion.answer, {
      count: 4,
      allowNegative: Boolean(lesson.config && lesson.config.allowNegative)
    });

    options.forEach(value => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = value;
      btn.onclick = () => chooseAnswer(value, btn);
      el.grid.appendChild(btn);
    });

    el.questionCard.classList.remove('hidden');
    el.reviewCard.classList.add('hidden');
    updateStatus();
  }

  function chooseAnswer(value, btn){
    if(answered) return;
    answered = true;
    const isCorrect = Number(value) === Number(currentQuestion.answer);
    if(isCorrect){
      state.right++;
      btn.classList.add('correct');
      el.feedback.textContent = 'Đúng rồi! Giỏi lắm con!';
      el.feedback.classList.remove('bad');
      play(el.audioDung);
    } else {
      state.wrong++;
      btn.classList.add('wrong');
      el.feedback.textContent = 'Chưa đúng rồi, con xem lại nhé!';
      el.feedback.classList.add('bad');
      state.wrongList.push({
        text: currentQuestion.questionText,
        correct: Number(currentQuestion.answer),
        choose: Number(value),
        type: currentQuestion.type,
        topic: currentQuestion.topic || lesson.topic,
        skill: currentQuestion.skill || lesson.skill || lesson.title,
        explanation: currentQuestion.explanation || ''
      });
      [...el.grid.children].forEach(child => {
        if(Number(child.textContent) === Number(currentQuestion.answer)) child.classList.add('correct');
      });
      play(el.audioSai);
    }
    saveState();
    updateStatus();
    setTimeout(() => { state.current++; saveState(); startQuestion(); }, 1200);
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
    const sessionData = buildSessionResult({ lesson, state });

    try {
      const onlineId = await saveSessionOnline(sessionData);
      state.saveMessage = '✅ Kết quả đã lưu ONLINE vào Firebase. Phụ huynh đăng nhập cùng tài khoản ở máy khác sẽ xem được lịch sử.';
      StudyStorage.saveSession({
        ...sessionData,
        onlineId,
        saveMode: 'online-backup'
      });
    } catch (error) {
      StudyStorage.saveSession({
        ...sessionData,
        saveMode: 'local-fallback',
        firebaseError: error.message
      });
      state.saveMessage = '⚠️ Firebase CHƯA lưu được. Kết quả chỉ đang lưu tạm trên máy này nên sang trình duyệt khác sẽ không thấy. Lỗi: ' + error.message;
      console.error('Firebase save failed:', error);
    }

    localStorage.removeItem(key);
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
    const wrongHtml = state.wrongList.length
      ? `<p>Các câu con cần ôn lại:</p><ol class="review-list">${state.wrongList.map(item => `<li>${escapeHtml(item.text)} = <strong>${escapeHtml(String(item.correct))}</strong> <span style="color:#c83911">(con chọn ${escapeHtml(String(item.choose))})</span></li>`).join('')}</ol>`
      : `<p style="text-align:center;font-size:22px;color:#12823b"><strong>Xuất sắc! Con không sai câu nào.</strong></p>`;

    el.reviewCard.innerHTML = `
      <h2>Kết quả lượt học</h2>
      <p class="save-message">${escapeHtml(state.saveMessage || '')}</p>
      <p style="text-align:center;font-size:22px">Con làm đúng <strong>${state.right}/${total}</strong> câu (${resultPercent}%).</p>
      ${wrongHtml}
      <div class="controls">
        <button class="btn" id="newRoundBtn">Làm lượt mới</button>
        <button class="btn secondary" id="historyBtn">Xem lịch sử học</button>
      </div>`;
    document.getElementById('newRoundBtn').onclick = reset;
    document.getElementById('historyBtn').onclick = () => { location.href = 'history.html'; };
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  el.hintBtn.onclick = showHint;
  el.resetBtn.onclick = reset;
  startQuestion();
})();
