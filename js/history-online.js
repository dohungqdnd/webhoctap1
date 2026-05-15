import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { loadSessionsOnline } from "./firebase-service.js";

const summaryGrid = document.getElementById("summaryGrid");
const historyList = document.getElementById("historyList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  renderLoading();

  try {
    const sessions = await loadSessionsOnline();
    renderSummary(sessions);
    renderHistory(sessions);
  } catch (error) {
    renderError(error);
  }
});

function renderLoading() {
  summaryGrid.innerHTML = "";
  historyList.innerHTML = `
    <div class="review-card">
      <h2>Đang tải lịch sử học...</h2>
      <p style="text-align:center">Trang này chỉ đọc dữ liệu ONLINE từ Firebase, không lấy lịch sử localStorage của trình duyệt.</p>
    </div>
  `;
}

function renderSummary(sessions) {
  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalCorrect = sessions.reduce((sum, item) => sum + Number(item.correct || 0), 0);
  const avgPercent = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const wrongBySkill = {};

  sessions.forEach((session) => {
    const wrongQuestions = session.wrongQuestions || session.wrongList || [];
    wrongQuestions.forEach((item) => {
      const key = item.skill || "Chưa phân loại";
      wrongBySkill[key] = (wrongBySkill[key] || 0) + 1;
    });
  });

  const weakestSkill = Object.entries(wrongBySkill).sort((a, b) => b[1] - a[1])[0];

  summaryGrid.innerHTML = `
    <div class="summary-card"><div class="summary-number">${totalSessions}</div><div class="summary-label">Lượt học online</div></div>
    <div class="summary-card"><div class="summary-number">${totalQuestions}</div><div class="summary-label">Tổng câu đã làm</div></div>
    <div class="summary-card"><div class="summary-number">${avgPercent}%</div><div class="summary-label">Tỷ lệ đúng trung bình</div></div>
    <div class="summary-card wide"><div class="summary-number small">${weakestSkill ? `${weakestSkill[0]} (${weakestSkill[1]} câu sai)` : "Chưa có dữ liệu"}</div><div class="summary-label">Nhóm phép tính hay sai nhất</div></div>
  `;
}

function renderHistory(sessions) {
  if (!sessions.length) {
    historyList.innerHTML = `
      <div class="review-card">
        <h2>Chưa có lịch sử học tập</h2>
        <p style="text-align:center">Con làm xong một lượt 10 câu thì kết quả phải xuất hiện ở đây nếu Firestore đã ghi thành công.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = sessions.map((item) => {
    const wrongQuestions = item.wrongQuestions || item.wrongList || [];
    const wrongHtml = wrongQuestions.length
      ? `<details><summary>Xem ${wrongQuestions.length} câu sai</summary><ol class="review-list compact">${wrongQuestions.map(w => `<li>${escapeHtml(w.text || "Câu hỏi")} = <strong>${escapeHtml(String(w.correct ?? ""))}</strong> <span style="color:#c83911">(con chọn ${escapeHtml(String(w.choose ?? ""))})</span> <em>${escapeHtml(w.skill || "")}</em></li>`).join("")}</ol></details>`
      : `<p class="good-text">Không sai câu nào.</p>`;

    return `
      <article class="history-card">
        <div class="history-head">
          <div>
            <h3>${escapeHtml(item.lessonTitle || "Bài học")}</h3>
            <p>${formatFirebaseDate(item.createdAt, item.finishedAt)}</p>
          </div>
          <div class="score-badge">${Number(item.correct || 0)}/${Number(item.total || 0)}<br><span>${Number(item.percent || 0)}%</span></div>
        </div>
        <p>Đúng: <strong>${Number(item.correct || 0)}</strong> · Sai: <strong>${Number(item.wrong || 0)}</strong> · Tổng: <strong>${Number(item.total || 0)}</strong></p>
        ${wrongHtml}
      </article>
    `;
  }).join("");
}

function renderError(error) {
  summaryGrid.innerHTML = "";
  historyList.innerHTML = `
    <div class="review-card">
      <h2>Chưa tải được lịch sử online</h2>
      <p style="text-align:center;color:#c83911">${escapeHtml(error.message || "Lỗi không xác định")}</p>
      <p style="text-align:center">Bạn kiểm tra lại firebase-config.js, Firestore Rules, Firestore Database đã được tạo chưa, và mở Console xem lỗi cụ thể.</p>
    </div>
  `;
}

function formatFirebaseDate(createdAt, fallbackIso) {
  try {
    if (createdAt && typeof createdAt.toDate === "function") {
      return createdAt.toDate().toLocaleString("vi-VN");
    }
    if (fallbackIso) {
      return new Date(fallbackIso).toLocaleString("vi-VN");
    }
  } catch (error) {}
  return "Chưa có thời gian";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
