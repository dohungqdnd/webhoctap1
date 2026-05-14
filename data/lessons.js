// Danh mục bài học. Muốn thêm bài mới, chỉ cần thêm 1 object vào mảng LESSONS.
const LESSONS = [
  { id: "lop1-cong10", grade: 1, title: "Cộng trong phạm vi 10", type: "add", min: 0, max: 10, total: 10 },
  { id: "lop1-tru10", grade: 1, title: "Trừ trong phạm vi 10", type: "sub", min: 0, max: 10, total: 10 },
  { id: "lop1-cong20", grade: 1, title: "Cộng trong phạm vi 20", type: "add", min: 0, max: 20, total: 10 },
  { id: "lop1-tru20", grade: 1, title: "Trừ trong phạm vi 20", type: "sub", min: 0, max: 20, total: 10 },

  { id: "lop2-cong100", grade: 2, title: "Cộng trong phạm vi 100", type: "add", min: 0, max: 100, total: 10 },
  { id: "lop2-tru100", grade: 2, title: "Trừ trong phạm vi 100", type: "sub", min: 0, max: 100, total: 10 },
  { id: "lop2-nhan-2-5", grade: 2, title: "Bảng nhân 2, 3, 4, 5", type: "mul", tables: [2, 3, 4, 5], total: 10 },
  { id: "lop2-chia-2-5", grade: 2, title: "Bảng chia 2, 3, 4, 5", type: "div", tables: [2, 3, 4, 5], total: 10 },

  { id: "lop3-cong1000", grade: 3, title: "Cộng trong phạm vi 1000", type: "add", min: 0, max: 1000, total: 10 },
  { id: "lop3-tru1000", grade: 3, title: "Trừ trong phạm vi 1000", type: "sub", min: 0, max: 1000, total: 10 },
  { id: "lop3-nhan-6-9", grade: 3, title: "Bảng nhân 6, 7, 8, 9", type: "mul", tables: [6, 7, 8, 9], total: 10 },
  { id: "lop3-chia-6-9", grade: 3, title: "Bảng chia 6, 7, 8, 9", type: "div", tables: [6, 7, 8, 9], total: 10 }
];
