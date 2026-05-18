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

---

## 2026-05-18 - Giai đoạn 2: Nâng cấp UI trang chủ theo luồng chọn bài

### 1. Đã nâng UI trang chủ như thế nào

Trang chủ `index.html` đã được đổi từ kiểu hiển thị toàn bộ bài học sang luồng 4 bước:

```text
Chọn lớp → Chọn chủ đề → Chọn mức độ → Bắt đầu học
```

Điểm chính:

- Không còn hiển thị tất cả bài học lẫn lộn trên trang chủ.
- Lớp học lấy tự động từ `data/grades.js`.
- Chủ đề lấy tự động từ trường `topic` trong `data/lessons.js`.
- Mức độ lấy tự động từ trường `level` trong `data/lessons.js`.
- Có trạng thái `active` khi đang chọn lớp/chủ đề/mức độ.
- Có thông báo rõ khi lớp, chủ đề hoặc mức độ chưa có bài.
- Lớp 4 và lớp 5 vẫn hiện trên giao diện, nếu chưa có bài sẽ báo “Sắp có bài mới”.
- Nút “Xem lịch sử học tập” vẫn trỏ tới `history.html`.
- Nút đăng xuất vẫn do `js/auth-guard.js` tự thêm vào header sau khi đăng nhập.

### 2. File đã chỉnh sửa

- `index.html`: dựng lại bố cục trang chủ thành 4 bước chọn bài.
- `js/app.js`: viết lại theo hướng quản lý trạng thái chọn lớp/chủ đề/mức độ/bài học.
- `css/style.css`: bổ sung CSS cho `grade-card`, `topic-card`, `level-card`, `lesson-card`, trạng thái `active` và `empty-state`.
- `CHANGELOG.md`: cập nhật nội dung Giai đoạn 2.

### 3. Các hàm chính trong `js/app.js`

- `renderGrades()`: hiển thị danh sách lớp từ `data/grades.js`.
- `renderTopics(selectedGrade)`: lọc và hiển thị chủ đề theo lớp đã chọn.
- `renderLevels(selectedGrade, selectedTopic)`: lọc và hiển thị mức độ theo lớp/chủ đề.
- `renderLessons(selectedGrade, selectedTopic, selectedLevel)`: lọc bài học và tạo nút “Bắt đầu học”.
- `resetBelowStep(step)`: khi đổi lớp/chủ đề/mức độ thì reset các bước phía sau để tránh chọn nhầm.

### 4. Cách thêm bài mới để hiện đúng lớp/chủ đề/mức độ

Chỉ cần thêm object mới vào `data/lessons.js` theo cấu trúc chuẩn:

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

Sau khi thêm:

- Nếu `grade: 4`, bài sẽ tự xuất hiện khi chọn “Lớp 4”.
- Nếu `topic: "Số tự nhiên"`, chủ đề “Số tự nhiên” sẽ tự hiện.
- Nếu `level: "easy"`, mức “Dễ” sẽ tự hiện.
- Nếu có nhiều bài cùng lớp/chủ đề/mức độ, trang chủ sẽ hiển thị danh sách để chọn.

### 5. Quy ước level đang dùng

```text
easy      → Dễ
medium    → Vừa
hard      → Khó
challenge → Thử thách
```

### 6. Chức năng được giữ nguyên

- Không thay đổi `practice.html`.
- Không thay đổi logic sinh câu hỏi trong `js/core/` và `js/generators/`.
- Không thay đổi đăng nhập Firebase Authentication.
- Không thay đổi lưu lịch sử Firestore theo `users/{uid}/sessions/{sessionId}`.
- Không thay đổi `history.html` và `history-online.js`.
- Âm thanh đúng/sai vẫn dùng `assets/audio/dung.mp3` và `assets/audio/sai.mp3`.
- Project vẫn chạy trực tiếp trên GitHub Pages, không cần npm, không framework, không build.
