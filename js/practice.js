(function(){
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson') || 'lop1-tru20';
  const lesson = LESSONS.find(l => l.id === lessonId) || LESSONS[0];
  const key = 'study_' + lesson.id;
  const total = lesson.total || 10;

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

  function defaultState(){ return { current:1, right:0, wrong:0, wrongList:[] }; }
  function loadState(){
    try { return JSON.parse(localStorage.getItem(key)) || defaultState(); }
    catch(e){ return defaultState(); }
  }
  function saveState(){ localStorage.setItem(key, JSON.stringify(state)); }
  function reset(){ localStorage.removeItem(key); state = defaultState(); startQuestion(); }
  function random(min,max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

  function generateQuestion(){
    let a,b,answer,symbol;
    const min = lesson.min ?? 0;
    const max = lesson.max ?? 20;
    if(lesson.type === 'add'){
      a = random(min, max);
      b = random(min, Math.max(min, max - a));
      answer = a + b; symbol = '+';
    } else if(lesson.type === 'sub'){
      a = random(min, max);
      b = random(min, a);
      answer = a - b; symbol = '-';
    } else if(lesson.type === 'mul'){
      a = lesson.tables[random(0, lesson.tables.length - 1)];
      b = random(1,10);
      answer = a * b; symbol = '×';
    } else if(lesson.type === 'div'){
      b = lesson.tables[random(0, lesson.tables.length - 1)];
      answer = random(1,10);
      a = b * answer; symbol = ':';
    }
    return { a, b, answer, symbol, text:`${a} ${symbol} ${b}` };
  }

  function makeChoices(answer){
    const choices = new Set([answer]);
    const spread = answer <= 20 ? 4 : Math.max(8, Math.round(answer * 0.12));
    while(choices.size < 4){
      let n = answer + random(-spread, spread);
      if(n >= 0) choices.add(n);
    }
    return [...choices].sort(() => Math.random() - 0.5);
  }

  function updateStatus(){
    el.currentNo.textContent = Math.min(state.current, total);
    el.totalNo.textContent = total;
    el.right.textContent = state.right;
    el.wrong.textContent = state.wrong;
  }

  function startQuestion(){
    if(state.current > total){ showReview(); return; }
    answered = false;
    currentQuestion = generateQuestion();
    el.subtitle.textContent = `${lesson.title} · ${total} câu/lượt`;
    el.title.textContent = lesson.title;
    el.expression.textContent = currentQuestion.text + ' = ?';
    el.feedback.textContent = '';
    el.feedback.classList.remove('bad');
    el.grid.innerHTML = '';
    makeChoices(currentQuestion.answer).forEach(value => {
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
    const isCorrect = Number(value) === currentQuestion.answer;
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
        text: currentQuestion.text,
        correct: currentQuestion.answer,
        choose: Number(value)
      });
      [...el.grid.children].forEach(child => {
        if(Number(child.textContent) === currentQuestion.answer) child.classList.add('correct');
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
    el.feedback.textContent = 'Gợi ý: Đáp án đúng là ' + currentQuestion.answer;
    el.feedback.classList.remove('bad');
  }

  function showReview(){
    el.questionCard.classList.add('hidden');
    el.reviewCard.classList.remove('hidden');
    const wrongHtml = state.wrongList.length
      ? `<p>Các câu con cần ôn lại:</p><ol class="review-list">${state.wrongList.map(item => `<li>${item.text} = <strong>${item.correct}</strong> <span style="color:#c83911">(con chọn ${item.choose})</span></li>`).join('')}</ol>`
      : `<p style="text-align:center;font-size:22px;color:#12823b"><strong>Xuất sắc! Con không sai câu nào.</strong></p>`;
    el.reviewCard.innerHTML = `
      <h2>Kết quả lượt học</h2>
      <p style="text-align:center;font-size:22px">Con làm đúng <strong>${state.right}/${total}</strong> câu.</p>
      ${wrongHtml}
      <div class="controls">
        <button class="btn" id="newRoundBtn">Làm lượt mới</button>
        <button class="btn secondary" id="reviewWrongBtn">Ôn lại câu sai</button>
      </div>`;
    document.getElementById('newRoundBtn').onclick = reset;
    document.getElementById('reviewWrongBtn').onclick = reviewWrongOnly;
  }

  function reviewWrongOnly(){
    if(!state.wrongList.length){ reset(); return; }
    // Mức đơn giản: đưa phụ huynh/bé xem danh sách câu sai; bấm lượt mới để hệ thống hỏi lại dạng ngẫu nhiên cùng chủ đề.
    alert('Danh sách câu sai đang hiển thị bên dưới. Con đọc lại từng câu rồi bấm “Làm lượt mới” để luyện tiếp cùng chủ đề nhé.');
  }

  el.hintBtn.onclick = showHint;
  el.resetBtn.onclick = reset;
  startQuestion();
})();
