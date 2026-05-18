export function percent(correct, total) {
  return total ? Math.round((Number(correct) / Number(total)) * 100) : 0;
}

export function createDefaultPracticeState(extra = {}) {
  return {
    current: 1,
    right: 0,
    wrong: 0,
    wrongList: [],
    startedAt: new Date().toISOString(),
    ...extra
  };
}

export function normalizeWrongQuestion(item, lesson = {}) {
  return {
    questionText: item.questionText || item.text || 'Câu hỏi',
    answer: item.answer ?? item.correct ?? '',
    userAnswer: item.userAnswer ?? item.choose ?? '',
    lessonId: item.lessonId || lesson.id || '',
    lessonTitle: item.lessonTitle || lesson.title || 'Bài học',
    grade: item.grade ?? lesson.grade ?? null,
    topic: item.topic || lesson.topic || '',
    skill: item.skill || lesson.skill || '',
    level: item.level || lesson.level || 'easy',
    type: item.type || '',
    explanation: item.explanation || '',
    createdAt: item.createdAt || new Date().toISOString()
  };
}

export function buildSessionResult({ lesson = {}, state, mode = 'normal', source = '' }) {
  const total = Number(state.total || lesson.totalQuestions || lesson.total || 10);
  const wrongQuestions = Array.isArray(state.wrongList)
    ? state.wrongList.map(item => normalizeWrongQuestion(item, lesson))
    : [];

  return {
    mode,
    source,
    lessonId: lesson.id || state.lessonId || '',
    lessonTitle: lesson.title || state.lessonTitle || (mode === 'review-wrong' ? 'Ôn câu sai' : 'Bài học'),
    grade: lesson.grade ?? state.grade ?? null,
    topic: lesson.topic || state.topic || '',
    skill: lesson.skill || state.skill || '',
    level: lesson.level || state.level || 'easy',
    generator: lesson.generator || '',
    correct: Number(state.right || 0),
    wrong: Number(state.wrong || 0),
    total,
    percent: percent(state.right || 0, total),
    startedAt: state.startedAt,
    finishedAt: new Date().toISOString(),
    wrongQuestions,
    wrongList: wrongQuestions
  };
}
