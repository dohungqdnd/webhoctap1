import { randomInt, pickOne } from "../core/random.js";

export function generate(lesson) {
  const config = lesson.config || {};
  if (config.type === "mul-div-combined") return generateMulDivCombined(lesson);

  const mode = config.mode || "all";
  if (mode === "add-sub") return generateAddSub(lesson);
  if (mode === "mul-div") return generateMulDiv(lesson);
  return generateAll(lesson);
}

function generateAddSub(lesson) {
  const config = lesson.config || {};
  const max = Number(config.max ?? 100);
  const a = randomInt(1, Math.min(max, 60));
  const b = randomInt(1, Math.min(30, max));
  const c = randomInt(0, Math.min(a + b, 30));
  const answer = a + b - c;
  return build(lesson, `${a} + ${b} - ${c}`, answer, "mixed-add-sub", "Cộng + Trừ", `Tính lần lượt từ trái sang phải: ${a} + ${b} - ${c} = ${answer}.`);
}

function generateMulDiv(lesson) {
  const config = lesson.config || {};
  const tables = config.tables || [2, 3, 4, 5];
  const b = pickOne(tables);
  const c = randomInt(1, 5);
  const a = randomInt(1, 10) * c;
  const answer = (a * b) / c;
  return build(lesson, `${a} × ${b} : ${c}`, answer, "mixed-mul-div", "Nhân + Chia", `Tính nhân trước rồi chia: ${a} × ${b} : ${c} = ${answer}.`);
}

function generateMulDivCombined(lesson) {
  const config = lesson.config || {};
  const forms = Array.isArray(config.forms) && config.forms.length ? config.forms : ["mul-div", "div-mul"];
  const maxRetry = Number(config.maxRetry || 150);

  for (let i = 0; i < maxRetry; i += 1) {
    const form = pickOne(forms);
    const question = form === "div-mul"
      ? tryBuildDivMulQuestion(lesson, config)
      : tryBuildMulDivQuestion(lesson, config);

    if (question) return question;
  }

  return build(
    lesson,
    "6 × 5 : 3",
    10,
    "mul-div-combined",
    "Nhân chia kết hợp",
    "Tính lần lượt từ trái sang phải: 6 × 5 : 3 = 10."
  );
}

function tryBuildMulDivQuestion(lesson, config) {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  const c = randomInt(2, 10);
  const product = a * b;

  if (product % c !== 0) return null;

  const answer = product / c;
  if (config.resultMax && answer > config.resultMax) return null;
  if (config.resultMin && answer < config.resultMin) return null;
  if (config.finalResultMax && answer > config.finalResultMax) return null;

  return build(
    lesson,
    `${a} × ${b} : ${c}`,
    answer,
    "mul-div-combined",
    "Nhân chia kết hợp",
    `Tính lần lượt từ trái sang phải: ${a} × ${b} : ${c} = ${answer}.`
  );
}

function tryBuildDivMulQuestion(lesson, config) {
  const quotientMin = Number(config.divFirstQuotientMin || 1);
  const quotientMax = Number(config.divFirstQuotientMax || 9);
  const multiplierMax = Number(config.multiplierMax || 9);

  if (quotientMin > quotientMax) return null;

  const b = randomInt(2, 10);
  const quotient = randomInt(quotientMin, quotientMax);
  const a = b * quotient;
  const c = randomInt(1, multiplierMax);
  const answer = quotient * c;

  if (config.finalResultMax && answer > config.finalResultMax) return null;

  return build(
    lesson,
    `${a} : ${b} × ${c}`,
    answer,
    "mul-div-combined",
    "Nhân chia kết hợp",
    `Tính lần lượt từ trái sang phải: ${a} : ${b} × ${c} = ${answer}.`
  );
}

function generateAll(lesson) {
  const config = lesson.config || {};
  const tables = config.tables || [2, 3, 4, 5, 6, 7, 8, 9];
  const max = Number(config.max ?? 100);
  const mode = pickOne(["mul_add", "mul_sub", "div_add", "div_sub", "add_sub"]);
  let a;
  let b;
  let c;
  let answer;

  if (mode === "mul_add") {
    a = pickOne(tables); b = randomInt(1, 10); c = randomInt(1, 20);
    answer = a * b + c;
    return build(lesson, `${a} × ${b} + ${c}`, answer, "mixed-all", "Nhân + Cộng", `${a} × ${b} + ${c} = ${answer}.`);
  }
  if (mode === "mul_sub") {
    a = pickOne(tables); b = randomInt(2, 10); c = randomInt(1, Math.max(1, a * b));
    answer = a * b - c;
    return build(lesson, `${a} × ${b} - ${c}`, answer, "mixed-all", "Nhân + Trừ", `${a} × ${b} - ${c} = ${answer}.`);
  }
  if (mode === "div_add") {
    b = pickOne(tables); answer = randomInt(1, 10); a = b * answer; c = randomInt(1, 20);
    const finalAnswer = answer + c;
    return build(lesson, `${a} : ${b} + ${c}`, finalAnswer, "mixed-all", "Chia + Cộng", `${a} : ${b} + ${c} = ${finalAnswer}.`);
  }
  if (mode === "div_sub") {
    b = pickOne(tables); answer = randomInt(3, 10); a = b * answer; c = randomInt(1, answer);
    const finalAnswer = answer - c;
    return build(lesson, `${a} : ${b} - ${c}`, finalAnswer, "mixed-all", "Chia + Trừ", `${a} : ${b} - ${c} = ${finalAnswer}.`);
  }

  a = randomInt(10, max); b = randomInt(1, 30); c = randomInt(1, Math.min(a + b, 40));
  answer = a + b - c;
  return build(lesson, `${a} + ${b} - ${c}`, answer, "mixed-all", "Cộng + Trừ", `${a} + ${b} - ${c} = ${answer}.`);
}

function build(lesson, questionText, answer, type, skill, explanation) {
  return {
    questionText,
    answer,
    type,
    topic: lesson.topic || "Tổng hợp",
    skill: lesson.skill || skill,
    explanation
  };
}
