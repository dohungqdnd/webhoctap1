(function(){
  const gradesConfig = Array.isArray(window.GRADES) ? window.GRADES : [];
  const lessons = Array.isArray(window.LESSONS) ? window.LESSONS : [];

  const els = {
    gradeList: document.getElementById('gradeList'),
    topicList: document.getElementById('topicList'),
    levelList: document.getElementById('levelList'),
    lessonList: document.getElementById('lessonList'),
    stepTopic: document.getElementById('stepTopic'),
    stepLevel: document.getElementById('stepLevel'),
    stepLesson: document.getElementById('stepLesson')
  };

  const state = {
    grade: Number(localStorage.getItem('homeSelectedGrade')) || null,
    topic: null,
    level: null
  };

  const levelLabels = {
    easy: 'Dễ',
    medium: 'Vừa',
    hard: 'Khó',
    challenge: 'Thử thách'
  };

  const levelHints = {
    easy: 'Làm quen, câu ngắn',
    medium: 'Kết hợp nhẹ',
    hard: 'Cần tập trung hơn',
    challenge: 'Dành cho bé muốn thử sức'
  };

  const levelOrder = ['easy', 'medium', 'hard', 'challenge'];

  function uniqueValues(items, key){
    return [...new Set(items.map(item => item[key]).filter(Boolean))];
  }

  function countLessons(filterFn){
    return lessons.filter(filterFn).length;
  }

  function getLessonsByGrade(grade){
    return lessons.filter(lesson => Number(lesson.grade) === Number(grade));
  }

  function setStepDisabled(stepEl, disabled){
    if(!stepEl) return;
    stepEl.classList.toggle('disabled', !!disabled);
  }

  function emptyState(message, detail){
    return `<div class="empty-state"><strong>${message}</strong>${detail ? `<span>${detail}</span>` : ''}</div>`;
  }

  function resetBelowStep(step){
    if(step <= 1){
      state.topic = null;
      state.level = null;
      els.topicList.innerHTML = emptyState('Hãy chọn lớp trước.');
      els.levelList.innerHTML = emptyState('Hãy chọn chủ đề trước.');
      els.lessonList.innerHTML = emptyState('Hãy chọn đủ lớp, chủ đề và mức độ.');
    }
    if(step <= 2){
      state.level = null;
      els.levelList.innerHTML = emptyState('Hãy chọn chủ đề trước.');
      els.lessonList.innerHTML = emptyState('Hãy chọn mức độ để hiện bài học.');
    }
    if(step <= 3){
      els.lessonList.innerHTML = emptyState('Hãy chọn mức độ để hiện bài học.');
    }
  }

  function renderGrades(){
    els.gradeList.innerHTML = '';
    const grades = gradesConfig.length
      ? gradesConfig
      : uniqueValues(lessons, 'grade').map(grade => ({ id: `lop${grade}`, grade, title: `Lớp ${grade}` }));

    grades.forEach(gradeInfo => {
      const grade = Number(gradeInfo.grade);
      const availableCount = countLessons(lesson => Number(lesson.grade) === grade);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'grade-card' + (state.grade === grade ? ' active' : '') + (!availableCount ? ' muted' : '');
      button.innerHTML = `
        <span class="card-title">${gradeInfo.title || `Lớp ${grade}`}</span>
        <span class="card-subtitle">${availableCount ? `${availableCount} bài học` : 'Sắp có bài mới'}</span>
      `;
      button.addEventListener('click', () => {
        state.grade = grade;
        localStorage.setItem('homeSelectedGrade', String(grade));
        resetBelowStep(1);
        renderGrades();
        renderTopics(state.grade);
      });
      els.gradeList.appendChild(button);
    });
  }

  function renderTopics(selectedGrade){
    const gradeLessons = getLessonsByGrade(selectedGrade);
    setStepDisabled(els.stepTopic, !selectedGrade);
    setStepDisabled(els.stepLevel, true);
    setStepDisabled(els.stepLesson, true);

    if(!selectedGrade){
      els.topicList.innerHTML = emptyState('Hãy chọn lớp trước.');
      return;
    }

    if(!gradeLessons.length){
      const gradeInfo = gradesConfig.find(g => Number(g.grade) === Number(selectedGrade));
      els.topicList.innerHTML = emptyState('Sắp có bài mới', gradeInfo?.description || 'Có thể thêm bài trong data/lessons.js.');
      els.levelList.innerHTML = emptyState('Chưa có mức độ cho lớp này.');
      els.lessonList.innerHTML = emptyState('Chưa có bài học để bắt đầu.');
      return;
    }

    const topics = uniqueValues(gradeLessons, 'topic');
    els.topicList.innerHTML = '';
    topics.forEach(topic => {
      const total = gradeLessons.filter(lesson => lesson.topic === topic).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'topic-card' + (state.topic === topic ? ' active' : '');
      button.innerHTML = `<span class="card-title">${topic}</span><span class="card-subtitle">${total} bài</span>`;
      button.addEventListener('click', () => {
        state.topic = topic;
        resetBelowStep(2);
        renderTopics(state.grade);
        renderLevels(state.grade, state.topic);
      });
      els.topicList.appendChild(button);
    });
  }

  function renderLevels(selectedGrade, selectedTopic){
    const topicLessons = getLessonsByGrade(selectedGrade).filter(lesson => lesson.topic === selectedTopic);
    setStepDisabled(els.stepLevel, !selectedTopic);
    setStepDisabled(els.stepLesson, true);

    if(!selectedTopic){
      els.levelList.innerHTML = emptyState('Hãy chọn chủ đề trước.');
      return;
    }

    if(!topicLessons.length){
      els.levelList.innerHTML = emptyState('Chủ đề này chưa có bài.', 'Hãy chọn chủ đề khác hoặc thêm bài trong data/lessons.js.');
      return;
    }

    const levels = uniqueValues(topicLessons, 'level').sort((a,b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
    els.levelList.innerHTML = '';
    levels.forEach(level => {
      const total = topicLessons.filter(lesson => lesson.level === level).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `level-card level-${level}` + (state.level === level ? ' active' : '');
      button.innerHTML = `
        <span class="level-badge">${levelLabels[level] || level}</span>
        <span class="card-subtitle">${levelHints[level] || 'Mức luyện tập'} · ${total} bài</span>
      `;
      button.addEventListener('click', () => {
        state.level = level;
        resetBelowStep(3);
        renderLevels(state.grade, state.topic);
        renderLessons(state.grade, state.topic, state.level);
      });
      els.levelList.appendChild(button);
    });
  }

  function renderLessons(selectedGrade, selectedTopic, selectedLevel){
    setStepDisabled(els.stepLesson, !selectedLevel);

    if(!selectedGrade || !selectedTopic || !selectedLevel){
      els.lessonList.innerHTML = emptyState('Hãy chọn đủ lớp, chủ đề và mức độ.');
      return;
    }

    const matchedLessons = lessons.filter(lesson =>
      Number(lesson.grade) === Number(selectedGrade) &&
      lesson.topic === selectedTopic &&
      lesson.level === selectedLevel
    );

    if(!matchedLessons.length){
      els.lessonList.innerHTML = emptyState('Chưa có bài phù hợp.', 'Hãy chọn mức độ khác hoặc thêm bài mới trong data/lessons.js.');
      return;
    }

    els.lessonList.innerHTML = '';
    matchedLessons.forEach(lesson => {
      const card = document.createElement('div');
      card.className = 'lesson-card lesson-pick-card active';
      card.innerHTML = `
        <div class="lesson-main">
          <div class="lesson-title">${lesson.title}</div>
          <div class="lesson-meta">${lesson.skill || lesson.topic} · ${lesson.totalQuestions || 10} câu/lượt · ${levelLabels[lesson.level] || lesson.level}</div>
        </div>
        <a class="btn start-btn" href="practice.html?lesson=${encodeURIComponent(lesson.id)}">Bắt đầu học</a>
      `;
      els.lessonList.appendChild(card);
    });
  }

  function init(){
    renderGrades();
    resetBelowStep(1);

    if(state.grade){
      renderTopics(state.grade);
    } else {
      setStepDisabled(els.stepTopic, true);
      setStepDisabled(els.stepLevel, true);
      setStepDisabled(els.stepLesson, true);
    }
  }

  init();

  window.WebHocTapHome = {
    renderGrades,
    renderTopics,
    renderLevels,
    renderLessons,
    resetBelowStep
  };
})();
