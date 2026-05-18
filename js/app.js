(function(){
  const gradeTabs = document.getElementById('gradeTabs');
  const lessonGrid = document.getElementById('lessonGrid');
  const gradesConfig = window.GRADES || [];
  const lessons = window.LESSONS || [];
  const grades = gradesConfig.length
    ? gradesConfig.map(g => g.grade).sort((a,b)=>a-b)
    : [...new Set(lessons.map(l => l.grade))].sort((a,b)=>a-b);
  let activeGrade = Number(localStorage.getItem('activeGrade')) || grades[0];

  function levelText(level){
    if(level === 'hard' || level === 3) return 'Mức 3 · Tổng hợp';
    if(level === 'medium' || level === 2) return 'Mức 2 · Kết hợp nhẹ';
    return 'Mức 1 · Cơ bản';
  }

  function renderTabs(){
    gradeTabs.innerHTML = '';
    grades.forEach(grade => {
      const gradeInfo = gradesConfig.find(g => g.grade === grade) || { title: 'Lớp ' + grade };
      const btn = document.createElement('button');
      btn.className = 'grade-btn' + (grade === activeGrade ? ' active' : '');
      btn.textContent = gradeInfo.title || ('Lớp ' + grade);
      btn.onclick = () => { activeGrade = grade; localStorage.setItem('activeGrade', grade); renderTabs(); renderLessons(); };
      gradeTabs.appendChild(btn);
    });
  }

  function renderLessons(){
    const gradeLessons = lessons.filter(l => l.grade === activeGrade);
    lessonGrid.innerHTML = '';

    if(!gradeLessons.length){
      const gradeInfo = gradesConfig.find(g => g.grade === activeGrade);
      lessonGrid.innerHTML = `<div class="lesson-card"><div class="lesson-title">Đang chuẩn bị bài học</div><div class="lesson-meta">${gradeInfo?.description || 'Có thể thêm bài mới trong data/lessons.js.'}</div></div>`;
      return;
    }

    gradeLessons.forEach(lesson => {
      const a = document.createElement('a');
      a.className = 'lesson-card level-' + (lesson.level || 'easy');
      a.href = `practice.html?lesson=${encodeURIComponent(lesson.id)}`;
      a.innerHTML = `<div class="lesson-title">${lesson.title}</div><div class="lesson-meta">${lesson.totalQuestions || lesson.total || 10} câu/lượt · ${levelText(lesson.level || 'easy')} · ${lesson.topic || 'Toán'} · Có lưu lịch sử</div>`;
      lessonGrid.appendChild(a);
    });
  }

  renderTabs();
  renderLessons();
})();
