import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  renderUserBar(user);
});

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
    window.location.href = "login.html";
  });
}
