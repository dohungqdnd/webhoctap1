(function(){
  const HISTORY_KEY = 'study_history_v1';
  const LAST_WRONG_KEY = 'lastWrongQuestions';
  const REVIEW_WRONG_KEY = 'reviewWrongQuestions';

  function readJson(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch(e){ return fallback; }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getHistory(){
    return readJson(HISTORY_KEY, []);
  }

  function setHistory(history){
    writeJson(HISTORY_KEY, history);
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

  function normalizeWrongQuestions(wrongQuestions){
    if(!Array.isArray(wrongQuestions)) return [];
    return wrongQuestions.filter(Boolean).map(item => ({
      questionText: item.questionText || item.text || 'Câu hỏi',
      answer: item.answer ?? item.correct ?? '',
      userAnswer: item.userAnswer ?? item.choose ?? '',
      lessonId: item.lessonId || '',
      lessonTitle: item.lessonTitle || '',
      grade: item.grade ?? null,
      topic: item.topic || '',
      skill: item.skill || '',
      level: item.level || 'easy',
      type: item.type || '',
      explanation: item.explanation || '',
      createdAt: item.createdAt || new Date().toISOString()
    }));
  }

  function saveLastWrongQuestions(wrongQuestions){
    writeJson(LAST_WRONG_KEY, normalizeWrongQuestions(wrongQuestions));
  }

  function getLastWrongQuestions(){
    return normalizeWrongQuestions(readJson(LAST_WRONG_KEY, []));
  }

  function saveReviewWrongQuestions(wrongQuestions){
    writeJson(REVIEW_WRONG_KEY, normalizeWrongQuestions(wrongQuestions));
  }

  function getReviewWrongQuestions(){
    return normalizeWrongQuestions(readJson(REVIEW_WRONG_KEY, []));
  }

  function clearReviewWrongQuestions(){
    localStorage.removeItem(REVIEW_WRONG_KEY);
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
      const wrongQuestions = session.wrongQuestions || session.wrongList || [];
      wrongQuestions.forEach(item => {
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

  window.StudyStorage = {
    getHistory,
    saveSession,
    clearHistory,
    getSummary,
    percent,
    formatDate,
    saveLastWrongQuestions,
    getLastWrongQuestions,
    saveReviewWrongQuestions,
    getReviewWrongQuestions,
    clearReviewWrongQuestions,
    normalizeWrongQuestions
  };
})();
