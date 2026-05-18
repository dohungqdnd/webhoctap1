export function percent(correct, total) {
  return total ? Math.round((Number(correct) / Number(total)) * 100) : 0;
}

export function createDefaultPracticeState() {
  return {
    current: 1,
    right: 0,
    wrong: 0,
    wrongList: [],
    startedAt: new Date().toISOString()
  };
}

export function buildSessionResult({ lesson, state }) {
  const total = Number(lesson.totalQuestions || lesson.total || 10);
  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    grade: lesson.grade,
    topic: lesson.topic || "",
    skill: lesson.skill || "",
    level: lesson.level || "easy",
    generator: lesson.generator || "",
    correct: Number(state.right || 0),
    wrong: Number(state.wrong || 0),
    total,
    percent: percent(state.right || 0, total),
    startedAt: state.startedAt,
    finishedAt: new Date().toISOString(),
    wrongList: Array.isArray(state.wrongList) ? state.wrongList : []
  };
}
