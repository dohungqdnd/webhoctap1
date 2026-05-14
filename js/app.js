(function(){
  const gradeTabs = document.getElementById('gradeTabs');
  const lessonGrid = document.getElementById('lessonGrid');
  const grades = [...new Set(LESSONS.map(l => l.grade))].sort((a,b)=>a-b);
  let activeGrade = Number(localStorage.getItem('activeGrade')) || grades[0];

  function renderTabs(){
    gradeTabs.innerHTML = '';
    grades.forEach(grade => {
      const btn = document.createElement('button');
      btn.className = 'grade-btn' + (grade === activeGrade ? ' active' : '');
      btn.textContent = 'Lớp ' + grade;
      btn.onclick = () => { activeGrade = grade; localStorage.setItem('activeGrade', grade); renderTabs(); renderLessons(); };
      gradeTabs.appendChild(btn);
    });
  }

  function renderLessons(){
    lessonGrid.innerHTML = '';
    LESSONS.filter(l => l.grade === activeGrade).forEach(lesson => {
      const a = document.createElement('a');
      a.className = 'lesson-card';
      a.href = `practice.html?lesson=${encodeURIComponent(lesson.id)}`;
      a.innerHTML = `<div class="lesson-title">${lesson.title}</div><div class="lesson-meta">${lesson.total || 10} câu/lượt · Có lưu câu sai</div>`;
      lessonGrid.appendChild(a);
    });
  }

  renderTabs();
  renderLessons();
})();
