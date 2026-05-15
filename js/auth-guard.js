import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const isLoginPage = location.pathname.endsWith("login.html");

function goLogin() {
  const current = location.pathname.split("/").pop() || "index.html";
  location.replace(`login.html?redirect=${encodeURIComponent(current + location.search)}`);
}

function showPage() {
  document.documentElement.classList.remove("auth-loading");
  document.body.style.visibility = "visible";
}

function renderUserBar(user) {
  if (document.getElementById("userBar")) return;

  const header = document.querySelector(".app-header");
  if (!header) return;

  const bar = document.createElement("div");
  bar.id = "userBar";
  bar.className = "user-bar";
  bar.innerHTML = `
    <span class="user-email">${user.email || "Đã đăng nhập"}</span>
    <button class="btn secondary small-btn" id="logoutBtn">Đăng xuất</button>
  `;

  header.appendChild(bar);

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    location.replace("login.html");
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user && !isLoginPage) {
    goLogin();
    return;
  }

  if (user && isLoginPage) {
    location.replace("index.html");
    return;
  }

  if (user) renderUserBar(user);
  showPage();
});

// Nếu Firebase bị lỗi cấu hình/mạng, không để màn hình trắng quá lâu.
setTimeout(() => {
  if (!isLoginPage && document.documentElement.classList.contains("auth-loading")) {
    console.warn("Auth guard timeout. Kiểm tra firebase-config.js và Authorized domains.");
    goLogin();
  }
}, 4000);
