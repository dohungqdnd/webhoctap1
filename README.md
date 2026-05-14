# Web học toán cho bé - bản GitHub Pages

Bản này đã được tái cấu trúc để chạy tĩnh trên GitHub Pages.

## Chức năng chính
- Một trang chọn bài: `index.html`
- Một trang luyện tập chung: `practice.html`
- Một trang lịch sử học tập: `history.html`
- Có phép tính đơn lẻ: cộng, trừ, nhân, chia
- Có phép tính tổng hợp: cộng + trừ, nhân + chia, + − × ÷
- Mỗi lượt 10 câu
- Lưu kết quả học vào localStorage trên trình duyệt
- Lưu danh sách câu sai để phụ huynh xem lại

## Cách thêm bài mới
Mở file:

```text
data/lessons.js
```

Thêm một object mới vào mảng `LESSONS`.

Ví dụ:

```js
{ id: "lop3-mixed-all", grade: 3, title: "Tổng hợp + − × ÷", type: "mixed_all", min: 0, max: 100, tables: [2,3,4,5,6,7,8,9], total: 10, level: 3 }
```

## Upload GitHub Pages
Upload toàn bộ file/thư mục trong project này lên repository GitHub, sau đó bật Pages ở Settings → Pages → Deploy from branch → main → /root.
