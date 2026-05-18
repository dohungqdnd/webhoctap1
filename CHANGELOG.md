# CHANGELOG - Tái cấu trúc kiến trúc module

## 2026-05-18

### 1. Đã đổi cấu trúc gì

Đã tách phần sinh câu hỏi khỏi `practice.js` và khỏi file gộp cũ `js/generator.js`.

Cấu trúc mới chính:

```text
webhoctap1/
├─ data/
│  ├─ grades.js
│  └─ lessons.js
├─ js/
│  ├─ app.js
│  ├─ practice.js
│  ├─ storage.js
│  ├─ firebase-config.js
│  ├─ login.js
│  ├─ auth-guard.js
│  ├─ history-online.js
│  ├─ firebase-service.js
│  ├─ core/
│  │  ├─ random.js
│  │  ├─ answer-options.js
│  │  ├─ question-router.js
│  │  └─ score.js
│  └─ generators/
│     ├─ add-sub.js
│     ├─ mul-div.js
│     ├─ mixed.js
│     └─ find-x.js
```

### 2. File quan trọng

- `data/grades.js`: cấu hình lớp 2, 3, 4, 5. Lớp 4 và lớp 5 đã để sẵn trạng thái chuẩn bị.
- `data/lessons.js`: danh sách bài học theo cấu hình chuẩn, gồm `id`, `grade`, `title`, `topic`, `skill`, `level`, `generator`, `totalQuestions`, `config`.
- `js/core/question-router.js`: nhận `lesson`, đọc `lesson.generator`, rồi gọi đúng module sinh câu hỏi.
- `js/core/random.js`: hàm random dùng chung.
- `js/core/answer-options.js`: sinh đáp án nhiễu gần đáp án đúng, không trùng, không âm nếu bài không cho phép.
- `js/core/score.js`: chuẩn hóa tính điểm và dữ liệu kết quả trước khi lưu.
- `js/generators/*.js`: mỗi dạng toán nằm trong một file riêng.
- `js/practice.js`: chỉ còn xử lý luồng luyện tập, chấm bài, tổng kết, lưu Firestore và local fallback.
- `js/firebase-config.js`: giữ nguyên cấu hình Firebase hiện tại.
- `js/firebase-service.js`: giữ nguyên lớp giao tiếp Firestore theo đường dẫn `users/{uid}/sessions/{sessionId}`.

### 3. Chức năng đã giữ nguyên

- Đăng nhập/tạo tài khoản bằng Firebase Authentication.
- Chặn trang học/lịch sử nếu chưa đăng nhập bằng `auth-guard.js`.
- Luyện tập từng bài.
- Âm thanh đúng/sai từ `assets/audio/dung.mp3` và `assets/audio/sai.mp3`.
- Lưu lịch sử online Firestore theo `users/{uid}/sessions`.
- Nếu Firebase lỗi, vẫn lưu localStorage dự phòng.
- Chạy trực tiếp trên GitHub Pages, không dùng npm, không dùng framework, không cần build.

### 4. Sau này muốn thêm dạng toán mới thì thêm ở đâu

Ví dụ muốn thêm dạng phân số cho lớp 4:

1. Tạo file mới:

```text
js/generators/fraction.js
```

2. File generator mới cần export hàm:

```js
export function generate(lesson) {
  return {
    questionText: "1/2 + 1/3",
    answer: "5/6",
    type: "fraction-add",
    topic: "Phân số",
    skill: "Cộng phân số",
    explanation: "Quy đồng mẫu số rồi cộng tử số."
  };
}
```

3. Mở `js/core/question-router.js`, import generator mới và đăng ký:

```js
import { generate as generateFraction } from "../generators/fraction.js";

const GENERATORS = {
  "add-sub": generateAddSub,
  "mul-div": generateMulDiv,
  "mixed": generateMixed,
  "find-x": generateFindX,
  "fraction": generateFraction
};
```

4. Nếu đáp án không phải số nguyên, bổ sung hàm tạo đáp án nhiễu tương ứng trong `js/core/answer-options.js`, ví dụ `createFractionOptions()`.

### 5. Sau này muốn thêm bài mới thì sửa file nào

Chỉ cần sửa:

```text
data/lessons.js
```

Ví dụ thêm bài lớp 4:

```js
{
  id: "lop4-cong-so-lon",
  grade: 4,
  title: "Cộng số lớn",
  topic: "Số tự nhiên",
  skill: "Cộng số nhiều chữ số",
  level: "easy",
  generator: "add-sub",
  totalQuestions: 10,
  config: {
    operators: ["+"],
    min: 1000,
    max: 100000,
    allowNegative: false
  }
}
```

Nếu `generator` đã có trong `question-router.js` thì không cần sửa thêm file nào khác.

### 6. Ghi chú triển khai

- Upload toàn bộ thư mục `webhoctap1/` lên GitHub Pages.
- Không cần cài đặt thư viện.
- Không cần chạy lệnh build.
- Nếu thay đổi Firebase, chỉ sửa `js/firebase-config.js`.
