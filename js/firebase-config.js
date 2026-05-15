// js/firebase-config.js
// ------------------------------------------------------------
// BƯỚC BẮT BUỘC:
// 1) Vào Firebase Console > Project settings > General > Your apps
// 2) Copy cấu hình firebaseConfig của Web App
// 3) Dán đè toàn bộ các giá trị mẫu bên dưới
// ------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "DAN_API_KEY_CUA_BAN",
  authDomain: "TEN_PROJECT.firebaseapp.com",
  projectId: "TEN_PROJECT",
  storageBucket: "TEN_PROJECT.appspot.com",
  messagingSenderId: "DAN_MESSAGING_ID",
  appId: "DAN_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
