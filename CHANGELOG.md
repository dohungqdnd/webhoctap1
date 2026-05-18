# CHANGELOG

## Giai đoạn 3 – Thêm chức năng “Ôn câu sai”

### Đã nâng cấp chức năng gì?
- Sau mỗi lượt học thường, hệ thống lưu đầy đủ danh sách câu sai vào `wrongQuestions`.
- Nếu lượt học có câu sai, màn hình kết quả hiển thị nút **“Ôn lại câu sai”**.
- Khi bấm nút này, `practice.html?review=last` sẽ mở chế độ ôn lại đúng các câu sai của lượt vừa học.
- Trong chế độ ôn câu sai:
  - Không sinh câu hỏi mới.
  - Chỉ dùng lại các câu bé đã sai.
  - Vẫn tạo đáp án nhiễu bằng `createNumberOptions()`.
  - Vẫn có âm thanh đúng/sai.
  - Vẫn đếm số câu, số đúng, số sai.
  - Nếu bé sửa đúng, hiển thị: **“Tốt lắm, con đã sửa được câu này!”**
  - Nếu vẫn sai, hiển thị đáp án đúng và giải thích nếu có.
- Trang chủ có nút **“Ôn câu sai gần nhất”** nếu localStorage còn dữ liệu câu sai gần nhất.
- Trang lịch sử online có nút **“Ôn lại câu sai của lượt này”** với các session có câu sai.

### Dữ liệu câu sai hiện lưu gồm
Mỗi câu sai được chuẩn hóa theo dạng:

```js
{
  questionText,
  answer,
  userAnswer,
  lessonId,
  lessonTitle,
  grade,
  topic,
  skill,
  level,
  type,
  explanation,
  createdAt
}
```

### LocalStorage keys được dùng
- `lastWrongQuestions`: lưu câu sai của lượt học thường gần nhất.
- `reviewWrongQuestions`: lưu tạm câu sai được chọn từ trang lịch sử trước khi chuyển sang `practice.html?review=session`.
- `study_history_v1`: lịch sử dự phòng localStorage cũ, vẫn giữ nguyên.
- `study_{lessonId}`: trạng thái tạm của lượt học thường.
- `review_wrong_last`, `review_wrong_session`: trạng thái tạm của lượt ôn câu sai.

### Session Firestore của chế độ ôn câu sai khác gì session thường?
Session ôn câu sai vẫn lưu tại:

```txt
users/{uid}/sessions/{sessionId}
```

Nhưng có thêm:

```js
mode: "review-wrong",
source: "last-session" // hoặc "history-session"
```

Session thường có:

```js
mode: "normal"
```

### File đã chỉnh sửa chính
- `js/practice.js`
  - Thêm `initNormalPractice()`.
  - Thêm `initWrongReview()`.
  - Tách `loadNextQuestion()`, `handleAnswer()`, `finishSession()`, `saveLastWrongQuestions()`.
- `js/storage.js`
  - Thêm các hàm lưu/đọc câu sai gần nhất và câu sai từ lịch sử.
- `js/core/score.js`
  - Chuẩn hóa dữ liệu session và `wrongQuestions`.
- `js/firebase-service.js`
  - Lưu thêm `mode`, `source`, `topic`, `skill`, `generator`, `wrongQuestions`.
- `js/history-online.js`
  - Thêm nút ôn lại câu sai theo từng session.
- `js/app.js`
  - Hiển thị nút ôn câu sai gần nhất trên trang chủ.
- `index.html`, `history.html`, `css/style.css`
  - Bổ sung UI cho nút ôn câu sai.

### Sau này muốn mở rộng ôn câu sai theo chủ đề/kỹ năng thì sửa ở đâu?
- Lọc dữ liệu câu sai theo `topic`, `skill`, `grade`, `level` tại `js/storage.js` hoặc `js/history-online.js`.
- Thêm màn hình chọn nhóm câu sai ở `js/app.js`.
- Nếu có phân số/số thập phân, mở rộng `js/core/answer-options.js` bằng các hàm như:
  - `createFractionOptions()`
  - `createDecimalOptions()`
- Nếu muốn ôn câu sai lâu dài từ Firestore thay vì localStorage tạm, thêm hàm truy vấn theo session hoặc theo `wrongQuestions` trong `js/firebase-service.js`.

## Giai đoạn 2 – Nâng UI trang chủ theo luồng chọn lớp → chủ đề → mức độ → bài học
- Trang chủ không còn hiển thị tất cả bài lẫn lộn.
- Dữ liệu lớp lấy từ `data/grades.js`.
- Dữ liệu bài lấy từ `data/lessons.js`.
- Chủ đề và mức độ được sinh động từ dữ liệu bài học.

## Giai đoạn 1 – Tái cấu trúc module
- Tách dữ liệu bài học, router sinh câu hỏi, core dùng chung và từng generator.
- Giữ chạy trực tiếp trên GitHub Pages, không cần npm/framework/build.
