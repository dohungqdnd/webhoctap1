(function(){
  const summaryGrid = document.getElementById('summaryGrid');
  const historyList = document.getElementById('historyList');
  const clearBtn = document.getElementById('clearHistoryBtn');

  function renderSummary(){
    const s = StudyStorage.getSummary();
    summaryGrid.innerHTML = `
      <div class="summary-card"><div class="summary-number">${s.totalSessions}</div><div class="summary-label">Lượt học</div></div>
      <div class="summary-card"><div class="summary-number">${s.totalQuestions}</div><div class="summary-label">Tổng câu đã làm</div></div>
      <div class="summary-card"><div class="summary-number">${s.avgPercent}%</div><div class="summary-label">Tỷ lệ đúng trung bình</div></div>
      <div class="summary-card wide"><div class="summary-number small">${s.weakestSkill}</div><div class="summary-label">Nhóm phép tính hay sai nhất</div></div>
    `;
  }

  function renderHistory(){
    const history = StudyStorage.getHistory();
    if(!history.length){
      historyList.innerHTML = `<div class="review-card"><h2>Chưa có lịch sử học</h2><p style="text-align:center">Con làm xong một lượt 10 câu thì kết quả sẽ tự lưu ở đây.</p></div>`;
      return;
    }

    historyList.innerHTML = history.map(item => {
      const wrongHtml = item.wrongList && item.wrongList.length
        ? `<details><summary>Xem ${item.wrongList.length} câu sai</summary><ol class="review-list compact">${item.wrongList.map(w => `<li>${w.text} = <strong>${w.correct}</strong> <span style="color:#c83911">(con chọn ${w.choose})</span> <em>${w.skill || ''}</em></li>`).join('')}</ol></details>`
        : `<p class="good-text">Không sai câu nào.</p>`;
      return `
        <article class="history-card">
          <div class="history-head">
            <div>
              <h3>${item.lessonTitle || 'Bài học'}</h3>
              <p>${StudyStorage.formatDate(item.savedAt)}</p>
            </div>
            <div class="score-badge">${item.correct}/${item.total}<br><span>${item.percent}%</span></div>
          </div>
          <p>Đúng: <strong>${item.correct}</strong> · Sai: <strong>${item.wrong}</strong> · Tổng: <strong>${item.total}</strong></p>
          ${wrongHtml}
        </article>`;
    }).join('');
  }

  clearBtn.onclick = function(){
    if(confirm('Bạn có chắc muốn xóa toàn bộ lịch sử học của con không?')){
      StudyStorage.clearHistory();
      renderSummary();
      renderHistory();
    }
  };

  renderSummary();
  renderHistory();
})();
