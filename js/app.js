(function(){
  const gradeTabs = document.getElementById('gradeTabs');
  const lessonGrid = document.getElementById('lessonGrid');
  const grades = [...new Set(LESSONS.map(l => l.grade))].sort((a,b)=>a-b);
  let activeGrade = Number(localStorage.getItem('activeGrade')) || grades[0];

  function levelText(level){
    if(level === 3) return 'Mức 3 · Tổng hợp';
    if(level === 2) return 'Mức 2 · Kết hợp nhẹ';
    return 'Mức 1 · Cơ bản';
  }

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
      a.className = 'lesson-card level-' + (lesson.level || 1);
      a.href = `practice.html?lesson=${encodeURIComponent(lesson.id)}`;
      a.innerHTML = `<div class="lesson-title">${lesson.title}</div><div class="lesson-meta">${lesson.total || 10} câu/lượt · ${levelText(lesson.level || 1)} · Có lưu lịch sử</div>`;
      lessonGrid.appendChild(a);
    });
  }

  renderTabs();
  renderLessons();
})();
