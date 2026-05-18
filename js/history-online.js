import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { loadSessionsOnline } from "./firebase-service.js";

const el = {
  logoutBtn: document.getElementById("logoutBtn"),
  quickInsight: document.getElementById("quickInsight"),
  overviewGrid: document.getElementById("overviewGrid"),
  filterBar: document.getElementById("filterBar"),
  gradeFilter: document.getElementById("gradeFilter"),
  topicFilter: document.getElementById("topicFilter"),
  topicStats: document.getElementById("topicStats"),
  skillStats: document.getElementById("skillStats"),
  historyList: document.getElementById("historyList")
};

let allSessions = [];
let filteredSessions = [];
let activeRange = "all";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  bindBaseEvents();
  renderLoading();

  try {
    allSessions = normalizeSessions(await loadSessions());
    setupFilters(allSessions);
    applyFilters();
  } catch (error) {
    renderError(error);
  }
});

function bindBaseEvents(){
  if(el.logoutBtn && !el.logoutBtn.dataset.bound){
    el.logoutBtn.dataset.bound = "1";
    el.logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  }

  if(el.filterBar && !el.filterBar.dataset.bound){
    el.filterBar.dataset.bound = "1";
    el.filterBar.addEventListener("click", (event) => {
      const btn = event.target.closest(".filter-btn");
      if(!btn) return;
      activeRange = btn.dataset.range || "all";
      el.filterBar.querySelectorAll(".filter-btn").forEach(item => item.classList.toggle("active", item === btn));
      applyFilters();
    });
  }

  if(el.gradeFilter && !el.gradeFilter.dataset.bound){
    el.gradeFilter.dataset.bound = "1";
    el.gradeFilter.addEventListener("change", applyFilters);
  }

  if(el.topicFilter && !el.topicFilter.dataset.bound){
    el.topicFilter.dataset.bound = "1";
    el.topicFilter.addEventListener("change", applyFilters);
  }
}

async function loadSessions(){
  return await loadSessionsOnline();
}

function applyFilters(){
  const gradeValue = el.gradeFilter?.value || "all";
  const topicValue = el.topicFilter?.value || "all";
  const now = new Date();

  filteredSessions = allSessions.filter(session => {
    const sessionDate = getSessionDate(session);
    const inRange = activeRange === "all" || daysBetween(sessionDate, now) <= Number(activeRange);
    const gradeOk = gradeValue === "all" || String(session.grade ?? "unclassified") === gradeValue;
    const topicOk = topicValue === "all" || (session.topic || "Chưa phân loại") === topicValue;
    return inRange && gradeOk && topicOk;
  });

  const overview = calculateOverview(filteredSessions);
  const topicStats = calculateTopicStats(filteredSessions);
  const skillStats = calculateSkillStats(filteredSessions);

  renderQuickInsight(overview, skillStats);
  renderOverview(overview);
  renderTopicStats(topicStats);
  renderSkillStats(skillStats, overview.totalQuestions);
  renderSessionList(filteredSessions);
}

function calculateOverview(sessions){
  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalCorrect = sessions.reduce((sum, item) => sum + Number(item.correct || 0), 0);
  const totalWrong = sessions.reduce((sum, item) => sum + Number(item.wrong || 0), 0);
  const avgPercent = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const learningDays = new Set(sessions.map(item => formatDateKey(getSessionDate(item))).filter(Boolean)).size;
  const latest = sessions.length ? sessions[0] : null;

  return { totalSessions, totalQuestions, totalCorrect, totalWrong, avgPercent, learningDays, latest };
}

function calculateTopicStats(sessions){
  const map = new Map();
  sessions.forEach(session => {
    const topic = session.topic || "Chưa phân loại";
    if(!map.has(topic)) map.set(topic, { topic, total: 0, correct: 0, wrong: 0 });
    const item = map.get(topic);
    item.total += Number(session.total || 0);
    item.correct += Number(session.correct || 0);
    item.wrong += Number(session.wrong || 0);
  });

  return [...map.values()]
    .map(item => ({
      ...item,
      percent: item.total ? Math.round((item.correct / item.total) * 100) : 0,
      comment: getTopicComment(item.total ? Math.round((item.correct / item.total) * 100) : 0)
    }))
    .sort((a,b) => b.total - a.total || a.topic.localeCompare(b.topic, "vi"));
}

function calculateSkillStats(sessions){
  const map = new Map();
  sessions.forEach(session => {
    const total = Number(session.total || 0);
    const wrongQuestions = normalizeWrongQuestions(session.wrongQuestions || session.wrongList || [], session);

    if(wrongQuestions.length){
      wrongQuestions.forEach(question => {
        const skill = question.skill || session.skill || "Chưa phân loại";
        if(!map.has(skill)) map.set(skill, { skill, wrong: 0, total: 0 });
        const item = map.get(skill);
        item.wrong += 1;
      });
    }

    const fallbackSkill = session.skill || "Chưa phân loại";
    if(!map.has(fallbackSkill)) map.set(fallbackSkill, { skill: fallbackSkill, wrong: 0, total: 0 });
    map.get(fallbackSkill).total += total;
  });

  return [...map.values()]
    .map(item => ({
      ...item,
      wrongRate: item.total ? Math.round((item.wrong / item.total) * 100) : (item.wrong ? 100 : 0)
    }))
    .sort((a,b) => b.wrong - a.wrong || b.wrongRate - a.wrongRate || a.skill.localeCompare(b.skill, "vi"));
}

function renderOverview(overview){
  if(!overview.totalSessions){
    el.overviewGrid.innerHTML = `<div class="empty-state"><strong>Chưa có dữ liệu học tập</strong><span>Con làm xong một lượt học thì dashboard sẽ tự tổng hợp tại đây.</span></div>`;
    return;
  }

  el.overviewGrid.innerHTML = `
    ${statCard(overview.totalSessions, "Tổng số lượt học")}
    ${statCard(overview.totalQuestions, "Tổng số câu đã làm")}
    ${statCard(overview.avgPercent + "%", "Tỷ lệ đúng trung bình")}
    ${statCard(overview.totalWrong, "Tổng số câu sai")}
    ${statCard(overview.learningDays, "Số ngày có học")}
    ${statCard(formatFirebaseDate(overview.latest?.createdAt, overview.latest?.finishedAt), "Lượt học gần nhất", true)}
  `;
}

function renderTopicStats(stats){
  if(!stats.length){
    el.topicStats.innerHTML = `<div class="empty-state"><strong>Chưa có dữ liệu theo chủ đề</strong><span>Khi con học xong, các chủ đề sẽ được tự động tổng hợp.</span></div>`;
    return;
  }

  el.topicStats.innerHTML = `
    <div class="topic-table">
      ${stats.map(item => `
        <div class="topic-row">
          <div class="topic-name"><strong>${escapeHtml(item.topic)}</strong><span>${item.correct} đúng · ${item.wrong} sai · ${item.total} câu</span></div>
          <div class="progress-wrap" aria-label="${item.percent}% đúng">
            <div class="progress-bar"><span style="width:${clamp(item.percent,0,100)}%"></span></div>
            <b>${item.percent}%</b>
          </div>
          <div class="topic-comment ${commentClass(item.percent)}">${item.comment}</div>
        </div>`).join("")}
    </div>`;
}

function renderSkillStats(stats, totalQuestions){
  const usefulStats = stats.filter(item => item.wrong > 0);
  if(!usefulStats.length){
    el.skillStats.innerHTML = `<div class="empty-state"><strong>Chưa thấy kỹ năng nào sai nhiều</strong><span>Rất tốt! Phụ huynh có thể cho bé duy trì luyện đều mỗi ngày.</span></div>`;
    return;
  }

  const topSkills = usefulStats.slice(0, 3).map(item => item.skill).join(", ");
  el.skillStats.innerHTML = `
    <div class="skill-warning">Nên cho bé ôn thêm: <strong>${escapeHtml(topSkills)}</strong></div>
    <div class="skill-list">
      ${usefulStats.map(item => `
        <div class="skill-item">
          <div><strong>${escapeHtml(item.skill)}</strong><span>${item.wrong} câu sai</span></div>
          <div class="skill-rate">Sai ${item.wrongRate}%</div>
        </div>`).join("")}
    </div>`;
}

function renderQuickInsight(overview, skillStats){
  if(!overview.totalSessions){
    el.quickInsight.innerHTML = `<h2>Nhận định nhanh</h2><p>Chưa có dữ liệu học tập. Nên cho bé bắt đầu với 10 câu/ngày để tạo thói quen.</p>`;
    return;
  }

  const messages = [];
  if(overview.avgPercent >= 85){
    messages.push("Bé đang học khá ổn, có thể tăng dần độ khó.");
  } else if(overview.avgPercent < 70){
    messages.push("Bé nên ôn lại các dạng cơ bản trước khi làm bài tổng hợp.");
  } else {
    messages.push("Bé đang ở mức khá ổn, nên duy trì luyện đều và ôn lại câu sai.");
  }

  const weakest = skillStats.find(item => item.wrong > 0);
  if(weakest){
    messages.push(`Cần chú ý thêm kỹ năng: ${weakest.skill}.`);
  }
  if(overview.totalSessions < 5){
    messages.push("Nên duy trì 10 câu mỗi ngày để hình thành thói quen.");
  }

  el.quickInsight.innerHTML = `
    <h2>Nhận định nhanh</h2>
    <ul>${messages.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderSessionList(sessions){
  if(!sessions.length){
    el.historyList.innerHTML = `<div class="empty-state"><strong>Chưa có dữ liệu học tập</strong><span>Không có lượt học nào phù hợp với bộ lọc hiện tại.</span></div>`;
    return;
  }

  el.historyList.innerHTML = sessions.map((item, index) => {
    const wrongQuestions = normalizeWrongQuestions(item.wrongQuestions || item.wrongList || [], item);
    const modeText = item.mode === "review-wrong" ? "Ôn câu sai" : "Luyện tập";
    const percentValue = Number(item.percent ?? window.StudyStorage?.percent?.(item.correct, item.total) ?? 0);
    const wrongHtml = wrongQuestions.length
      ? `<details><summary>Xem ${wrongQuestions.length} câu sai</summary><ol class="review-list compact">${wrongQuestions.map(w => `<li>${escapeHtml(w.questionText)} = <strong>${escapeHtml(String(w.answer ?? ""))}</strong> <span style="color:#c83911">(con chọn ${escapeHtml(String(w.userAnswer ?? ""))})</span> <em>${escapeHtml(w.skill || "")}</em></li>`).join("")}</ol></details>
         <button class="btn secondary review-session-btn" data-session-index="${index}">Ôn lại câu sai của lượt này</button>`
      : `<p class="good-text">Không sai câu nào.</p>`;

    return `
      <article class="history-card session-card">
        <div class="history-head">
          <div>
            <h3>${escapeHtml(item.lessonTitle || "Bài học")}</h3>
            <p>${escapeHtml(modeText)} · ${formatFirebaseDate(item.createdAt, item.finishedAt)}</p>
            <p class="session-meta">Lớp ${escapeHtml(item.grade ?? "?")} · ${escapeHtml(item.topic || "Chưa phân loại")} · ${escapeHtml(item.skill || "Chưa phân loại")}</p>
          </div>
          <div class="score-badge">${Number(item.correct || 0)}/${Number(item.total || 0)}<br><span>${percentValue}%</span></div>
        </div>
        <p>Đúng: <strong>${Number(item.correct || 0)}</strong> · Sai: <strong>${Number(item.wrong || 0)}</strong> · Tổng: <strong>${Number(item.total || 0)}</strong></p>
        ${wrongHtml}
      </article>
    `;
  }).join("");

  bindReviewButtons(sessions);
}

function setupFilters(sessions){
  const grades = uniqueValues(sessions.map(item => item.grade).filter(v => v !== null && v !== undefined && v !== ""));
  const topics = uniqueValues(sessions.map(item => item.topic || "Chưa phân loại"));

  el.gradeFilter.innerHTML = `<option value="all">Tất cả lớp</option>` + grades.map(grade => `<option value="${escapeHtml(String(grade))}">Lớp ${escapeHtml(String(grade))}</option>`).join("");
  el.topicFilter.innerHTML = `<option value="all">Tất cả chủ đề</option>` + topics.map(topic => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join("");
}

function bindReviewButtons(currentSessions){
  el.historyList.querySelectorAll(".review-session-btn").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.sessionIndex);
      const session = currentSessions[index];
      const wrongQuestions = normalizeWrongQuestions(session?.wrongQuestions || session?.wrongList || [], session || {});
      if(window.StudyStorage){
        StudyStorage.saveReviewWrongQuestions(wrongQuestions);
      } else {
        localStorage.setItem("reviewWrongQuestions", JSON.stringify(wrongQuestions));
      }
      window.location.href = "practice.html?review=session";
    });
  });
}

function normalizeSessions(sessions){
  return (Array.isArray(sessions) ? sessions : [])
    .map(item => ({
      ...item,
      grade: item.grade ?? null,
      topic: item.topic || "Chưa phân loại",
      skill: item.skill || "Chưa phân loại",
      level: item.level || "easy",
      mode: item.mode || "normal",
      total: Number(item.total || 0),
      correct: Number(item.correct || 0),
      wrong: Number(item.wrong ?? normalizeWrongQuestions(item.wrongQuestions || item.wrongList || [], item).length),
      percent: Number(item.percent || (item.total ? Math.round((Number(item.correct || 0) / Number(item.total || 0)) * 100) : 0))
    }))
    .sort((a,b) => getSessionDate(b) - getSessionDate(a));
}

function normalizeWrongQuestions(items, session = {}){
  if(window.StudyStorage && typeof StudyStorage.normalizeWrongQuestions === "function"){
    return StudyStorage.normalizeWrongQuestions(items).map(item => ({
      ...item,
      lessonId: item.lessonId || session.lessonId || "",
      lessonTitle: item.lessonTitle || session.lessonTitle || "Bài học",
      grade: item.grade ?? session.grade ?? null,
      topic: item.topic || session.topic || "Chưa phân loại",
      skill: item.skill || session.skill || "Chưa phân loại",
      level: item.level || session.level || "easy"
    }));
  }
  return (Array.isArray(items) ? items : []).map(item => ({
    questionText: item.questionText || item.text || "Câu hỏi",
    answer: item.answer ?? item.correct ?? "",
    userAnswer: item.userAnswer ?? item.choose ?? "",
    lessonId: item.lessonId || session.lessonId || "",
    lessonTitle: item.lessonTitle || session.lessonTitle || "Bài học",
    grade: item.grade ?? session.grade ?? null,
    topic: item.topic || session.topic || "Chưa phân loại",
    skill: item.skill || session.skill || "Chưa phân loại",
    level: item.level || session.level || "easy",
    type: item.type || "",
    explanation: item.explanation || "",
    createdAt: item.createdAt || new Date().toISOString()
  }));
}

function renderLoading(){
  el.quickInsight.innerHTML = `<h2>Nhận định nhanh</h2><p>Đang tải lịch sử học từ Firebase...</p>`;
  el.overviewGrid.innerHTML = `<div class="empty-state"><strong>Đang tải dữ liệu...</strong><span>Dashboard chỉ đọc dữ liệu online từ Firestore.</span></div>`;
  el.topicStats.innerHTML = "";
  el.skillStats.innerHTML = "";
  el.historyList.innerHTML = "";
}

function renderError(error){
  el.quickInsight.innerHTML = `<h2>Chưa tải được dữ liệu</h2><p>${escapeHtml(error.message || "Lỗi không xác định")}</p>`;
  el.overviewGrid.innerHTML = `<div class="empty-state"><strong>Chưa tải được lịch sử online</strong><span>Kiểm tra firebase-config.js, Firestore Rules và Firestore Database.</span></div>`;
  el.topicStats.innerHTML = "";
  el.skillStats.innerHTML = "";
  el.historyList.innerHTML = "";
}

function statCard(value, label, small = false){
  return `<div class="stat-card"><div class="stat-number ${small ? "small" : ""}">${escapeHtml(value)}</div><div class="stat-label">${escapeHtml(label)}</div></div>`;
}

function getTopicComment(percent){
  if(percent >= 85) return "Làm tốt";
  if(percent >= 70) return "Khá ổn";
  return "Cần ôn thêm";
}

function commentClass(percent){
  if(percent >= 85) return "good";
  if(percent >= 70) return "ok";
  return "need";
}

function getSessionDate(session){
  try {
    if(session?.createdAt && typeof session.createdAt.toDate === "function") return session.createdAt.toDate();
    if(session?.finishedAt) return new Date(session.finishedAt);
    if(session?.startedAt) return new Date(session.startedAt);
  } catch(error) {}
  return new Date(0);
}

function daysBetween(date, now){
  if(!(date instanceof Date) || Number.isNaN(date.getTime())) return Infinity;
  return Math.floor((now - date) / (24 * 60 * 60 * 1000));
}

function formatDateKey(date){
  if(!(date instanceof Date) || Number.isNaN(date.getTime()) || date.getTime() === 0) return "";
  return date.toISOString().slice(0,10);
}

function formatFirebaseDate(createdAt, fallbackIso){
  try {
    if(createdAt && typeof createdAt.toDate === "function") return createdAt.toDate().toLocaleString("vi-VN");
    if(fallbackIso) return new Date(fallbackIso).toLocaleString("vi-VN");
  } catch(error) {}
  return "Chưa có thời gian";
}

function uniqueValues(values){
  return [...new Set(values.map(value => String(value || "Chưa phân loại")))]
    .sort((a,b) => a.localeCompare(b, "vi", { numeric: true }));
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
