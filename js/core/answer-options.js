import { randomInt, shuffleArray } from "./random.js";

export function createNumberOptions(answer, options = {}) {
  const correct = Number(answer);
  const count = Number(options.count || 4);
  const allowNegative = Boolean(options.allowNegative);
  const choices = new Set([correct]);
  const baseSpread = correct <= 20 ? 4 : Math.max(8, Math.round(Math.abs(correct) * 0.12));
  let guard = 0;

  while (choices.size < count && guard < 160) {
    guard++;
    const offset = randomInt(-baseSpread, baseSpread);
    if (offset === 0) continue;
    const value = correct + offset;
    if (!allowNegative && value < 0) continue;
    choices.add(value);
  }

  let step = 1;
  while (choices.size < count) {
    const plus = correct + step;
    const minus = correct - step;
    if (allowNegative || plus >= 0) choices.add(plus);
    if (choices.size < count && (allowNegative || minus >= 0)) choices.add(minus);
    step++;
  }

  return shuffleArray([...choices]);
}

export function createFractionOptions() {
  throw new Error("createFractionOptions chưa triển khai. Có thể thêm khi mở rộng lớp 4, lớp 5.");
}

export function createDecimalOptions() {
  throw new Error("createDecimalOptions chưa triển khai. Có thể thêm khi mở rộng lớp 4, lớp 5.");
}
