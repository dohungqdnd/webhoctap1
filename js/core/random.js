export function randomInt(min, max) {
  const low = Math.ceil(Number(min));
  const high = Math.floor(Number(max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

export function shuffleArray(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function pickOne(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("pickOne cần một mảng có phần tử.");
  }
  return array[randomInt(0, array.length - 1)];
}
