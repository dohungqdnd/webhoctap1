import { generate as generateAddSub } from "../generators/add-sub.js";
import { generate as generateMulDiv } from "../generators/mul-div.js";
import { generate as generateMixed } from "../generators/mixed.js";
import { generate as generateFindX } from "../generators/find-x.js";

const GENERATORS = {
  "add-sub": generateAddSub,
  "mul-div": generateMulDiv,
  "mixed": generateMixed,
  "find-x": generateFindX
};

export function generateQuestion(lesson) {
  if (!lesson) {
    throw new Error("Không tìm thấy cấu hình bài học.");
  }
  const generatorName = lesson.generator;
  const generator = GENERATORS[generatorName];
  if (!generator) {
    throw new Error(`Generator '${generatorName}' chưa tồn tại. Kiểm tra lesson.generator hoặc thêm file trong js/generators/.`);
  }
  return generator(lesson);
}

export function listGenerators() {
  return Object.keys(GENERATORS);
}
if (lesson.generator === "mixed") {
  if (lesson.config && lesson.config.type === "mul-div-combined") {
    return generateMulDivCombined(lesson.config);
  }

  // giữ các logic cũ bên dưới
}
