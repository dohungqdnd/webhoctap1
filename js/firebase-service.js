import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export function waitForUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export async function saveSessionOnline(sessionData) {
  const user = auth.currentUser || await waitForUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập nên chưa lưu được kết quả online.");
  }

  const payload = {
    uid: user.uid,
    email: user.email || "",
    mode: sessionData.mode || "normal",
    source: sessionData.source || "",
    lessonId: sessionData.lessonId || "",
    lessonTitle: sessionData.lessonTitle || "Bài học",
    grade: sessionData.grade || null,
    topic: sessionData.topic || "",
    skill: sessionData.skill || "",
    level: sessionData.level || null,
    generator: sessionData.generator || "",
    total: Number(sessionData.total || 0),
    correct: Number(sessionData.correct || 0),
    wrong: Number(sessionData.wrong || 0),
    percent: Number(sessionData.percent || 0),
    wrongQuestions: sessionData.wrongQuestions || sessionData.wrongList || [],
    startedAt: sessionData.startedAt || "",
    finishedAt: sessionData.finishedAt || new Date().toISOString(),
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, "users", user.uid, "sessions"), payload);
  return ref.id;
}

export async function loadSessionsOnline() {
  const user = auth.currentUser || await waitForUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const q = query(
    collection(db, "users", user.uid, "sessions"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
