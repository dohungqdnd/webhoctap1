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

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ-5d9mhap7iytR85B0LIQCL1f_W_UA8U",
  authDomain: "webhoctap-f367d.firebaseapp.com",
  projectId: "webhoctap-f367d",
  storageBucket: "webhoctap-f367d.firebasestorage.app",
  messagingSenderId: "244556851807",
  appId: "1:244556851807:web:f15dba7be799690c3989ea",
  measurementId: "G-W6CHZH0E06"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
