// ====== بيانات ======
let xp = Number(localStorage.getItem("xp")) || 0;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let lastDate = localStorage.getItem("lastDate");

const rewards = {
  5: "شراء أداة",
  10: "يوم راحة",
  20: "إعلان ممول"
};

let claimed = JSON.parse(localStorage.getItem("claimed")) || [];

// ====== مهام ======
const taskPool = {
  1: [
    { name: "كتابة أفكار سلبية", xp: 10 },
    { name: "تحليل فكرة", xp: 15 },
    { name: "تسجيل موقف", xp: 10 }
  ],
  2: [
    { name: "تغيير فكرة", xp: 15 },
    { name: "تأكيدات", xp: 10 },
    { name: "تخيل قيادة", xp: 10 }
  ],
  3: [
    { name: "قرار سريع", xp: 20 },
    { name: "تحمل مسؤولية", xp: 20 },
    { name: "مهمة صعبة", xp: 25 }
  ]
};

// ====== أدوات ======
function save() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("lastDate", lastDate);
  localStorage.setItem("claimed", JSON.stringify(claimed));
}

function getLevel() {
  return Math.floor(xp / 100);
}

// ====== صوت وتأثير ======
function playSound(id) {
  let s = document.getElementById(id);
  if (s) {
    s.currentTime = 0;
    s.play();
  }
}

function flashEffect() {
  let f = document.getElementById("flash");
  f.classList.add("flash-active");
  setTimeout(() => f.classList.remove("flash-active"), 150);
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(100);
}

// ====== مهام يومية ======
function generateDailyTasks() {
  let today = new Date().toDateString();

  if (lastDate !== today) {
    let level = getLevel();
    let base = Math.min(level + 1, 3);

    tasks = taskPool[base].map(t => ({
      ...t,
      done: false
    }));

    lastDate = today;
    save();
  }
}

// ====== إنهاء مهمة ======
function doneTask(i) {
  if (!tasks[i].done) {
    tasks[i].done = true;
    xp += tasks[i].xp;

    playSound("sComplete");
    flashEffect();
    vibrate();

    save();
    render();
  }
}

// ====== المكافآت ======
function checkRewards(level) {
  if (rewards[level] && !claimed.includes(level)) {
    claimed.push(level);
    alert("🎁 " + rewards[level]);
    playSound("sLevel");
    flashEffect();
    save();
  }
}

function renderRewards() {
  let ul = document.getElementById("rewardsList");
  ul.innerHTML = "";

  Object.keys(rewards).forEach(lvl => {
    let li = document.createElement("li");
    li.innerHTML = claimed.includes(Number(lvl))
      ? "✔ Level " + lvl
      : "🔒 Level " + lvl;

    ul.appendChild(li);
  });
}

// ====== عرض ======
function render() {
  let tbody = document.getElementById("tasks");
  tbody.innerHTML = "";

  tasks.forEach((t, i) => {
    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${t.xp}</td>
      <td>${t.done ? "✔" : "<button onclick='doneTask("+i+")'>إنهاء</button>"}</td>
    `;

    tbody.appendChild(tr);
  });

  updateDashboard();
  renderRewards();
}

// ====== Dashboard ======
function updateDashboard() {
  let level = getLevel();
  let next = (level + 1) * 100;
  let progress = xp % 100;

  document.getElementById("level").innerText = level;
  document.getElementById("xp").innerText = xp;
  document.getElementById("next").innerText = next;
  document.getElementById("progress").value = progress;

  if (xp % 100 === 0 && xp !== 0) {
    playSound("sLevel");
    flashEffect();
  }

  checkRewards(level);
}

// ====== إشعارات ======
function notify() {
  if ("Notification" in window) {
    Notification.requestPermission().then(p => {
      if (p === "granted") {
        new Notification("📋 مهامك جاهزة اليوم");
      }
    });
  }
}

// ====== تشغيل ======
generateDailyTasks();
render();
notify();

// ====== Service Worker ======
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("SW OK"))
    .catch(e => console.log("SW ERR", e));
}
