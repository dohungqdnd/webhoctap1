# Câu lệnh / thao tác triển khai

## 1. Cấu trúc đã chuyển từ dạng copy nhiều folder sang dạng dùng chung

```text
web_hoc_tap_github/
├─ index.html
├─ practice.html
├─ assets/
│  ├─ audio/
│  └─ images/
├─ css/
│  └─ style.css
├─ data/
│  └─ lessons.js
└─ js/
   ├─ app.js
   └─ practice.js
```

## 2. Nếu dùng Git dòng lệnh

```bash
git init
git add .
git commit -m "Khoi tao web hoc tap cho be"
git branch -M main
git remote add origin https://github.com/TAI_KHOAN_CUA_BAN/TEN_REPO.git
git push -u origin main
```

Sau đó vào GitHub:

```text
Settings → Pages → Deploy from a branch → main / root → Save
```

## 3. Nếu không dùng Git dòng lệnh

- Tạo repository mới trên GitHub.
- Bấm Add file → Upload files.
- Kéo toàn bộ file trong thư mục này lên.
- Commit changes.
- Vào Settings → Pages → chọn main/root.
