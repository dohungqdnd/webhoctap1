(function(){
  const HISTORY_KEY = 'study_history_v1';

  function getHistory(){
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch(e){ return []; }
  }

  function setHistory(history){
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function saveSession(session){
    const history = getHistory();
    history.unshift({
      id: 'session_' + Date.now(),
      savedAt: new Date().toISOString(),
      ...session
    });
    setHistory(history.slice(0, 200));
  }

  function clearHistory(){
    localStorage.removeItem(HISTORY_KEY);
  }

  function percent(correct,total){
    return total ? Math.round((correct / total) * 100) : 0;
  }

  function getSummary(){
    const history = getHistory();
    const totalSessions = history.length;
    const totalQuestions = history.reduce((s,item) => s + (item.total || 0), 0);
    const totalCorrect = history.reduce((s,item) => s + (item.correct || 0), 0);
    const avgPercent = percent(totalCorrect, totalQuestions);
    const wrongBySkill = {};

    history.forEach(session => {
      (session.wrongList || []).forEach(item => {
        const key = item.skill || 'Chưa phân loại';
        wrongBySkill[key] = (wrongBySkill[key] || 0) + 1;
      });
    });

    const weakestSkill = Object.entries(wrongBySkill).sort((a,b) => b[1] - a[1])[0];

    return {
      totalSessions,
      totalQuestions,
      avgPercent,
      weakestSkill: weakestSkill ? `${weakestSkill[0]} (${weakestSkill[1]} câu sai)` : 'Chưa có dữ liệu'
    };
  }

  function formatDate(iso){
    try { return new Date(iso).toLocaleString('vi-VN'); }
    catch(e){ return iso || ''; }
  }

  window.StudyStorage = { getHistory, saveSession, clearHistory, getSummary, percent, formatDate };
})();
