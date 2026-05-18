// Danh mục bài học theo cấu hình chuẩn.
// Muốn thêm bài mới: thêm 1 object vào LESSONS, chọn generator phù hợp và điền config.
globalThis.LESSONS = [
  {
    id: "lop2-cong100",
    grade: 2,
    title: "Cộng trong phạm vi 100",
    topic: "Cộng trừ",
    skill: "Cộng cơ bản",
    level: "easy",
    generator: "add-sub",
    totalQuestions: 10,
    config: { operators: ["+"], min: 0, max: 100, allowNegative: false }
  },
  {
    id: "lop2-tru100",
    grade: 2,
    title: "Trừ trong phạm vi 100",
    topic: "Cộng trừ",
    skill: "Trừ cơ bản",
    level: "easy",
    generator: "add-sub",
    totalQuestions: 10,
    config: { operators: ["-"], min: 0, max: 100, allowNegative: false }
  },
  {
    id: "lop2-nhan-2-5",
    grade: 2,
    title: "Bảng nhân 2, 3, 4, 5",
    topic: "Nhân chia",
    skill: "Nhân cơ bản",
    level: "easy",
    generator: "mul-div",
    totalQuestions: 10,
    config: { operators: ["*"], tables: [2, 3, 4, 5], min: 1, max: 10, allowRemainder: false }
  },
  {
    id: "lop2-chia-2-5",
    grade: 2,
    title: "Bảng chia 2, 3, 4, 5",
    topic: "Nhân chia",
    skill: "Chia cơ bản",
    level: "easy",
    generator: "mul-div",
    totalQuestions: 10,
    config: { operators: ["/"], tables: [2, 3, 4, 5], min: 1, max: 10, allowRemainder: false }
  },
  {
    id: "lop2-mixed-cong-tru",
    grade: 2,
    title: "Tổng hợp cộng + trừ",
    topic: "Cộng trừ",
    skill: "Cộng trừ kết hợp",
    level: "medium",
    generator: "mixed",
    totalQuestions: 10,
    config: { mode: "add-sub", operators: ["+", "-"], min: 0, max: 50, allowNegative: false }
  },
  {
    id: "lop2-mixed-nhan-chia",
    grade: 2,
    title: "Tổng hợp nhân + chia",
    topic: "Nhân chia",
    skill: "Nhân chia kết hợp",
    level: "medium",
    generator: "mixed",
    totalQuestions: 10,
    config: { mode: "mul-div", operators: ["*", "/"], tables: [2, 3, 4, 5], min: 1, max: 10, allowRemainder: false }
  },
  {
    id: "lop3-cong1000",
    grade: 3,
    title: "Cộng trong phạm vi 1000",
    topic: "Cộng trừ",
    skill: "Cộng số có 3 chữ số",
    level: "easy",
    generator: "add-sub",
    totalQuestions: 10,
    config: { operators: ["+"], min: 0, max: 1000, allowNegative: false }
  },
  {
    id: "lop3-tru1000",
    grade: 3,
    title: "Trừ trong phạm vi 1000",
    topic: "Cộng trừ",
    skill: "Trừ số có 3 chữ số",
    level: "easy",
    generator: "add-sub",
    totalQuestions: 10,
    config: { operators: ["-"], min: 0, max: 1000, allowNegative: false }
  },
  {
    id: "lop3-nhan-6-9",
    grade: 3,
    title: "Bảng nhân 6, 7, 8, 9",
    topic: "Nhân chia",
    skill: "Nhân cơ bản",
    level: "easy",
    generator: "mul-div",
    totalQuestions: 10,
    config: { operators: ["*"], tables: [6, 7, 8, 9], min: 1, max: 10, allowRemainder: false }
  },
  {
    id: "lop3-chia-6-9",
    grade: 3,
    title: "Bảng chia 6, 7, 8, 9",
    topic: "Nhân chia",
    skill: "Chia cơ bản",
    level: "easy",
    generator: "mul-div",
    totalQuestions: 10,
    config: { operators: ["/"], tables: [6, 7, 8, 9], min: 1, max: 10, allowRemainder: false }
  },
  {
    id: "lop3-nhan-chia-bang",
    grade: 3,
    title: "Nhân chia trong bảng",
    topic: "Nhân chia",
    skill: "Nhân chia cơ bản",
    level: "easy",
    generator: "mul-div",
    totalQuestions: 10,
    config: { operators: ["*", "/"], min: 1, max: 10, tables: [2, 3, 4, 5, 6, 7, 8, 9], allowRemainder: false }
  },
  {
    id: "lop3-mixed-cong-tru",
    grade: 3,
    title: "Tổng hợp cộng + trừ",
    topic: "Cộng trừ",
    skill: "Cộng trừ kết hợp",
    level: "medium",
    generator: "mixed",
    totalQuestions: 10,
    config: { mode: "add-sub", operators: ["+", "-"], min: 0, max: 100, allowNegative: false }
  },
  {
    id: "lop3-mixed-nhan-chia",
    grade: 3,
    title: "Tổng hợp nhân + chia",
    topic: "Nhân chia",
    skill: "Nhân chia kết hợp",
    level: "medium",
    generator: "mixed",
    totalQuestions: 10,
    config: { mode: "mul-div", operators: ["*", "/"], tables: [2, 3, 4, 5, 6, 7, 8, 9], min: 1, max: 10, allowRemainder: false }
  },
  {
    id: "lop3-mixed-all",
    grade: 3,
    title: "Tổng hợp + − × ÷",
    topic: "Tổng hợp",
    skill: "Tính toán tổng hợp",
    level: "hard",
    generator: "mixed",
    totalQuestions: 10,
    config: { mode: "all", operators: ["+", "-", "*", "/"], min: 0, max: 100, tables: [2, 3, 4, 5, 6, 7, 8, 9], allowNegative: false, allowRemainder: false }
  },
  {
    id: "lop3-tim-x-co-ban",
    grade: 3,
    title: "Tìm x cơ bản",
    topic: "Tìm x",
    skill: "Tìm thành phần chưa biết",
    level: "medium",
    generator: "find-x",
    totalQuestions: 10,
    config: { operators: ["+", "-", "*", "/"], min: 1, max: 50, tables: [2, 3, 4, 5, 6, 7, 8, 9], allowNegative: false, allowRemainder: false }
  }
];
