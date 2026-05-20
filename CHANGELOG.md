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

## Giai đoạn 4 - Nâng cấp `history.html` thành Dashboard phụ huynh

### 1. Dashboard phụ huynh gồm những gì
- Giữ nguyên file `history.html` để không phá link cũ, nhưng đổi tiêu đề thành **Dashboard học tập của bé**.
- Thêm nút **Về trang chủ** và **Đăng xuất** ngay trên thanh đầu trang.
- Dữ liệu được đọc online từ Firestore theo đường dẫn hiện có:
  - `users/{uid}/sessions`
- Nếu chưa có dữ liệu hoặc bộ lọc không có kết quả, trang hiển thị trạng thái rõ ràng thay vì báo lỗi.

### 2. Các khối mới trên dashboard
- **Nhận định nhanh**:
  - Đánh giá chung theo tỷ lệ đúng trung bình.
  - Gợi ý ôn thêm kỹ năng sai nhiều nhất.
  - Nhắc duy trì 10 câu/ngày nếu số lượt học còn ít.
- **Tổng quan**:
  - Tổng số lượt học.
  - Tổng số câu đã làm.
  - Tỷ lệ đúng trung bình.
  - Tổng số câu sai.
  - Số ngày có học.
  - Lượt học gần nhất.
- **Phân tích theo chủ đề**:
  - Tự động nhóm theo `topic`.
  - Hiển thị số câu đã làm, đúng, sai, tỷ lệ đúng.
  - Có thanh tiến độ bằng HTML/CSS, không dùng Chart.js.
  - Nhận xét tự động:
    - `>= 85%`: Làm tốt.
    - `70–84%`: Khá ổn.
    - `< 70%`: Cần ôn thêm.
- **Kỹ năng cần chú ý**:
  - Tự động nhóm từ `wrongQuestions` và `skill`.
  - Sắp xếp kỹ năng sai nhiều nhất lên đầu.
  - Hiển thị gợi ý: “Nên cho bé ôn thêm: ...”.
- **Lịch sử từng lượt học**:
  - Vẫn giữ ngày giờ, tên bài, chế độ học, đúng/tổng, phần trăm.
  - Nếu lượt học có câu sai, vẫn có nút **Ôn lại câu sai của lượt này**.

### 3. Dữ liệu được tổng hợp như thế nào
- Dashboard đọc toàn bộ session online của tài khoản đang đăng nhập.
- Mỗi session được chuẩn hóa để tương thích cả dữ liệu cũ và mới.
- Nếu session thiếu `topic`, `skill`, `grade` thì hiển thị **Chưa phân loại** thay vì lỗi.
- Tổng quan tính từ các trường:
  - `total`
  - `correct`
  - `wrong`
  - `percent`
  - `createdAt` hoặc `finishedAt`
- Chủ đề được tổng hợp theo `topic`.
- Kỹ năng cần chú ý được tổng hợp ưu tiên từ `wrongQuestions[].skill`; nếu thiếu thì dùng `session.skill`.

### 4. Bộ lọc mới
- Bộ lọc thời gian:
  - Tất cả.
  - 7 ngày gần nhất.
  - 30 ngày gần nhất.
- Bộ lọc theo lớp.
- Bộ lọc theo chủ đề.
- Các bộ lọc chỉ ảnh hưởng dashboard và danh sách lịch sử, không ảnh hưởng dữ liệu Firestore.

### 5. File đã chỉnh sửa
- `history.html`
  - Đổi giao diện lịch sử cũ thành dashboard phụ huynh.
  - Thêm các vùng hiển thị: nhận định nhanh, tổng quan, bộ lọc, chủ đề, kỹ năng, lịch sử từng lượt.
- `js/history-online.js`
  - Viết lại theo các hàm rõ ràng:
    - `loadSessions()`
    - `applyFilters()`
    - `calculateOverview()`
    - `calculateTopicStats()`
    - `calculateSkillStats()`
    - `renderOverview()`
    - `renderTopicStats()`
    - `renderSkillStats()`
    - `renderQuickInsight()`
    - `renderSessionList()`
  - Giữ chức năng ôn lại câu sai từ từng session.
  - Thêm đăng xuất bằng Firebase Auth.
- `css/style.css`
  - Thêm style cho:
    - `dashboard-card`
    - `overview-grid`
    - `stat-card`
    - `progress-bar`
    - `topic-table`
    - `skill-warning`
    - `quick-insight`
    - `filter-bar`
    - `session-card`

### 6. Sau này muốn thêm biểu đồ thật / Chart.js thì thêm ở đâu
- Nên thêm biểu đồ trong `history.html`, tại các vùng:
  - Sau khối **Tổng quan** nếu muốn biểu đồ tiến bộ theo ngày.
  - Trong khối **Phân tích theo chủ đề** nếu muốn biểu đồ cột/chữ nhật.
- Logic xử lý dữ liệu nên đặt tiếp trong `js/history-online.js`, tách thêm hàm mới như:
  - `calculateTrendStats()`
  - `renderTrendChart()`
  - `renderTopicChart()`
- Nếu dùng Chart.js sau này, chỉ cần nhúng CDN trực tiếp trong HTML, không cần npm/build.


## Cập nhật bổ sung: Bài Tổng hợp nhân chia lớp 2

### Nội dung đã thêm
- Thêm 2 bài mới trong `data/lessons.js`:
  - `lop2-tong-hop-nhan-chia-vua`: Tổng hợp nhân chia - mức vừa.
  - `lop2-tong-hop-nhan-chia-kho`: Tổng hợp nhân chia - mức khó.
- Nâng cấp `js/generators/mixed.js` để hỗ trợ `config.type = "mul-div-combined"`.
- Dạng bài mới sinh theo 2 mẫu:
  - `a × b : c`
  - `a : b × c`

### Quy tắc mức vừa
- Với dạng `a × b : c`: kết quả cuối không lớn hơn 10.
- Với dạng `a : b × c`: kết quả phép chia đầu tiên nhỏ hơn hoặc bằng 9, số nhân tiếp theo không lớn hơn 9, kết quả cuối không quá 100.

### Quy tắc mức khó
- Với dạng `a × b : c`: kết quả cuối từ 11 trở lên.
- Với dạng `a : b × c`: kết quả phép chia đầu tiên từ 11 đến 99, số nhân tiếp theo không lớn hơn 9, kết quả cuối không quá 100.

### Ghi chú mở rộng
- Muốn chỉnh độ khó chỉ cần sửa `config` của lesson trong `data/lessons.js`.
- Không cần sửa `practice.js`, `history-online.js`, Firebase hoặc luồng lưu Firestore.
