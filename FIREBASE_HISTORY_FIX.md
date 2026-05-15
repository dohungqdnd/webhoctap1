# Sửa lỗi lịch sử chỉ lưu localStorage

Bản này đã chỉnh:

1. `practice.js` lưu Firestore trước.
2. Chỉ khi Firestore lỗi mới lưu `localStorage` dạng dự phòng.
3. `history.html` chỉ đọc lịch sử online từ Firebase, không đọc localStorage.
4. Thêm cache-busting `?v=20260515b` để tránh trình duyệt/GitHub Pages dùng JS cũ.

## Cách kiểm tra đúng

1. Đăng nhập tài khoản con.
2. Làm xong đủ 10 câu.
3. Ở màn hình kết quả phải thấy dòng:

`✅ Kết quả đã lưu ONLINE vào Firebase...`

Nếu thấy dòng cảnh báo Firebase chưa lưu được thì mở F12 > Console để xem lỗi.

4. Vào Firebase Console > Firestore Database > Data, kiểm tra có đường dẫn:

`users/{uid}/sessions/{sessionId}`

5. Mở trình duyệt khác, đăng nhập cùng tài khoản, vào `history.html`. Nếu Firestore có dữ liệu thì sẽ thấy lịch sử.

## Rule Firestore cần dùng

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
