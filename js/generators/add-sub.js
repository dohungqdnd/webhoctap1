import { randomInt, pickOne } from "../core/random.js";

export function generate(lesson) {
  const config = lesson.config || {};
  const operators = config.operators || ["+", "-"];
  const operator = pickOne(operators);
  const min = Number(config.min ?? 0);
  const max = Number(config.max ?? 100);
  let a;
  let b;
  let answer;

  if (operator === "+") {
    a = randomInt(min, max);
    b = randomInt(min, Math.max(min, max - a));
    answer = a + b;
    return formatQuestion({ lesson, questionText: `${a} + ${b}`, answer, type: "add", explanation: `${a} cộng ${b} bằng ${answer}.` });
  }

  a = randomInt(min, max);
  b = config.allowNegative ? randomInt(min, max) : randomInt(min, a);
  answer = a - b;
  return formatQuestion({ lesson, questionText: `${a} - ${b}`, answer, type: "sub", explanation: `${a} trừ ${b} bằng ${answer}.` });
}

function formatQuestion({ lesson, questionText, answer, type, explanation }) {
  return {
    questionText,
    answer,
    type,
    topic: lesson.topic || "Cộng trừ",
    skill: lesson.skill || (type === "add" ? "Cộng" : "Trừ"),
    explanation
  };
}
