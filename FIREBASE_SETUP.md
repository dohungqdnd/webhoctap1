# Hướng dẫn cấu hình Firebase cho Web học tập

Bản này dùng phương án đơn giản nhất:

- Con và phụ huynh dùng chung **một tài khoản đăng nhập**.
- Con học trên máy tính/tablet/điện thoại.
- Phụ huynh đăng nhập cùng tài khoản đó ở thiết bị khác để xem `history.html`.
- Website vẫn là web tĩnh, chạy trực tiếp trên GitHub Pages.

---

## 1. Bật Authentication Email/Password

Vào Firebase Console của project bạn đã tạo:

```text
Build → Authentication → Get started → Sign-in method
```

Bật:

```text
Email/Password
```

Sau đó bấm **Save**.

---

## 2. Tạo Cloud Firestore

Vào:

```text
Build → Firestore Database → Create database
```

Khuyên chọn:

```text
Start in production mode
```

Chọn location mặc định hoặc gần Việt Nam nhất nếu Firebase hiển thị lựa chọn phù hợp.

---

## 3. Dán Firebase config vào website

Mở file:

```text
js/firebase-config.js
```

Bạn sẽ thấy đoạn mẫu:

```js
export const firebaseConfig = {
  apiKey: "DAN_API_KEY_CUA_BAN",
  authDomain: "TEN_PROJECT.firebaseapp.com",
  projectId: "TEN_PROJECT",
  storageBucket: "TEN_PROJECT.appspot.com",
  messagingSenderId: "DAN_MESSAGING_ID",
  appId: "DAN_APP_ID"
};
```

Bạn thay toàn bộ giá trị mẫu bằng config Firebase thật của project.

Lấy config tại:

```text
Project settings → General → Your apps → Web app → SDK setup and configuration → Config
```

---

## 4. Thêm Authorized domain cho GitHub Pages

Sau khi website GitHub Pages có link dạng:

```text
https://ten-github.github.io/web-hoc-tap/
```

Bạn vào Firebase:

```text
Authentication → Settings → Authorized domains
```

Thêm domain:

```text
ten-github.github.io
```

Lưu ý: chỉ thêm domain, không thêm `/web-hoc-tap/`.

---

## 5. Cài Firestore Rules

Vào:

```text
Firestore Database → Rules
```

Dán rule sau:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      match /sessions/{sessionId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }
  }
}
```

Bấm **Publish**.

Ý nghĩa: tài khoản nào chỉ được đọc/ghi lịch sử học của chính tài khoản đó.

---

## 6. Upload lên GitHub Pages

Giải nén file `.zip`, sau đó upload toàn bộ nội dung lên repo GitHub Pages.

Cấu trúc đúng là:

```text
index.html
practice.html
history.html
login.html
css/
js/
data/
assets/
FIREBASE_SETUP.md
```

Không upload kiểu lồng thư mục như:

```text
web_hoc_tap_firebase/
  index.html
```

---

## 7. Test sau khi upload

1. Mở website GitHub Pages.
2. Nếu chưa đăng nhập, web tự chuyển sang `login.html`.
3. Tạo tài khoản cho con bằng email/password.
4. Vào chọn bài học.
5. Làm đủ 10 câu.
6. Vào `history.html` để xem lịch sử online.
7. Mở thiết bị khác, đăng nhập cùng tài khoản, vào `history.html` để kiểm tra từ xa.

---

## 8. Nếu lỗi không lưu được kết quả

Kiểm tra 4 điểm:

1. Đã dán đúng `firebaseConfig` chưa.
2. Đã bật Email/Password trong Authentication chưa.
3. Đã tạo Firestore Database chưa.
4. Đã Publish Firestore Rules chưa.
5. Đã thêm `ten-github.github.io` vào Authorized domains chưa.

Nếu Firebase lỗi khi lưu, web vẫn lưu tạm kết quả vào `localStorage` của máy đang học để tránh mất dữ liệu trong phiên bản này.
