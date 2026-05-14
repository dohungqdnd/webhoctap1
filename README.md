# Web học toán cho bé

Bản đã tái cấu trúc để đưa lên GitHub Pages/Netlify.

## Cách chạy local
Mở trực tiếp `index.html` bằng trình duyệt.

## Cách upload GitHub Pages
1. Tạo repository mới trên GitHub.
2. Upload toàn bộ file/thư mục trong gói này lên repository.
3. Vào Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: main / root.
6. Save và chờ GitHub tạo link.

## Cấu trúc chính
- `index.html`: trang chọn lớp/chủ đề.
- `practice.html`: trang luyện tập chung.
- `data/lessons.js`: danh mục bài học.
- `js/app.js`: render danh sách bài học.
- `js/practice.js`: sinh câu hỏi, chấm điểm, lưu câu sai.
- `css/style.css`: toàn bộ giao diện.
- `assets/audio`: âm thanh đúng/sai.
- `assets/images`: logo.

## Thêm bài học mới
Mở `data/lessons.js` và thêm 1 object mới vào mảng `LESSONS`.
