# Web học toán cho bé - bản Firebase

Bản này chạy trực tiếp trên GitHub Pages, có:

- Đăng nhập Firebase Email/Password.
- Con và phụ huynh dùng chung một tài khoản.
- Lưu kết quả học online vào Cloud Firestore.
- Trang lịch sử học `history.html` đọc dữ liệu online theo tài khoản đang đăng nhập.
- Vẫn lưu localStorage dự phòng nếu mạng/Firebase lỗi.

## File cần sửa trước khi upload

Mở:

```text
js/firebase-config.js
```

Dán Firebase config thật của project bạn.

Sau đó làm theo `FIREBASE_SETUP.md`.
