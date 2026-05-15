import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");
const params = new URLSearchParams(window.location.search);
const redirectTarget = params.get("redirect") || "index.html";

function setBusy(isBusy) {
  loginBtn.disabled = isBusy;
  registerBtn.disabled = isBusy;
  loginBtn.textContent = isBusy ? "Đang xử lý..." : "Đăng nhập";
}

function getInput() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    throw new Error("Bạn cần nhập email và mật khẩu.");
  }

  if (password.length < 6) {
    throw new Error("Mật khẩu Firebase cần tối thiểu 6 ký tự.");
  }

  return { email, password };
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.replace(redirectTarget);
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    setBusy(true);
    message.textContent = "";
    const { email, password } = getInput();
    await signInWithEmailAndPassword(auth, email, password);
    window.location.replace(redirectTarget);
  } catch (error) {
    message.textContent = "Đăng nhập chưa thành công: " + error.message;
  } finally {
    setBusy(false);
  }
});

registerBtn.addEventListener("click", async () => {
  try {
    setBusy(true);
    message.textContent = "";
    const { email, password } = getInput();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "child",
      displayName: "Tài khoản học tập của con",
      createdAt: serverTimestamp()
    }, { merge: true });

    window.location.replace(redirectTarget);
  } catch (error) {
    message.textContent = "Tạo tài khoản chưa thành công: " + error.message;
  } finally {
    setBusy(false);
  }
});
