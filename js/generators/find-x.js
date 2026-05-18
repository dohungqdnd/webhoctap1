import { randomInt, pickOne } from "../core/random.js";

export function generate(lesson) {
  const config = lesson.config || {};
  const operators = config.operators || ["+", "-", "*", "/"];
  const operator = pickOne(operators);
  const min = Number(config.min ?? 1);
  const max = Number(config.max ?? 50);
  const tables = config.tables || [2, 3, 4, 5, 6, 7, 8, 9];
  const x = randomInt(min, Math.min(max, 20));
  let known;
  let result;
  let questionText;
  let explanation;

  if (operator === "+") {
    known = randomInt(1, max);
    result = x + known;
    questionText = `x + ${known} = ${result}`;
    explanation = `Muốn tìm x, lấy ${result} - ${known} = ${x}.`;
  } else if (operator === "-") {
    known = randomInt(1, x);
    result = x - known;
    questionText = `x - ${known} = ${result}`;
    explanation = `Muốn tìm x, lấy ${result} + ${known} = ${x}.`;
  } else if (operator === "*") {
    known = pickOne(tables);
    result = x * known;
    questionText = `x × ${known} = ${result}`;
    explanation = `Muốn tìm x, lấy ${result} : ${known} = ${x}.`;
  } else {
    known = pickOne(tables);
    result = x;
    const dividend = x * known;
    questionText = `${dividend} : x = ${known}`;
    explanation = `Vì ${dividend} : x = ${known}, nên x = ${dividend} : ${known} = ${x}.`;
  }

  return {
    questionText,
    answer: x,
    type: "find-x",
    topic: lesson.topic || "Tìm x",
    skill: lesson.skill || "Tìm thành phần chưa biết",
    explanation
  };
}
