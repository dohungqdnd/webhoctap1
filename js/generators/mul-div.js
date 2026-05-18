import { randomInt, pickOne } from "../core/random.js";

export function generate(lesson) {
  const config = lesson.config || {};
  const operators = config.operators || ["*", "/"];
  const operator = pickOne(operators);
  const tables = config.tables || makeRange(Number(config.min ?? 1), Number(config.max ?? 10));
  let a;
  let b;
  let answer;

  if (operator === "*") {
    a = pickOne(tables);
    b = randomInt(Number(config.min ?? 1), Number(config.max ?? 10));
    answer = a * b;
    return formatQuestion({ lesson, questionText: `${a} × ${b}`, answer, type: "mul", explanation: `${a} nhân ${b} bằng ${answer}.` });
  }

  b = pickOne(tables);
  answer = randomInt(Number(config.min ?? 1), Number(config.max ?? 10));
  a = b * answer;
  return formatQuestion({ lesson, questionText: `${a} : ${b}`, answer, type: "div", explanation: `${a} chia ${b} bằng ${answer}.` });
}

function makeRange(min, max) {
  const result = [];
  for (let i = min; i <= max; i++) result.push(i);
  return result;
}

function formatQuestion({ lesson, questionText, answer, type, explanation }) {
  return {
    questionText,
    answer,
    type,
    topic: lesson.topic || "Nhân chia",
    skill: lesson.skill || (type === "mul" ? "Nhân" : "Chia"),
    explanation
  };
}
