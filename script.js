/* =====================================================
   PENGATURAN - UBAH DI SINI
   ===================================================== */

// Nomor WhatsApp tujuan balasan.
// Format: kode negara tanpa "+" dan tanpa 0 di depan.
// Contoh: 0812-3456-7890  ->  "6281234567890"
const NOMOR_WA = "6285748570879";

// Nama yang muncul di layar akhir ("LOVE YOU ...")
const NAMA = "Pendekkkk";

/* ===================================================== */

const $ = (id) => document.getElementById(id);
const PALET = ["#ff4d6d", "#ffd1dc", "#bfe9ff", "#22d3ee", "#ffffff"];
const rand = (a, b) => a + Math.random() * (b - a);

document.querySelectorAll(".nama").forEach((el) => (el.textContent = NAMA.toUpperCase()));

/* ---------- Pindah layar ---------- */
const screens = [...document.querySelectorAll(".screen")];

function show(id) {
  screens.forEach((s) => s.classList.toggle("active", s.id === id));
  window.scrollTo(0, 0);
  if (id === "s-match") initMatch();
  if (id === "s-catch") initCatch();
  if (id === "s-pick") confetti();
  if (id === "s-final") rainHearts();
}
document.querySelectorAll("[data-next]").forEach((b) =>
  b.addEventListener("click", () => show(b.dataset.next))
);

/* ---------- Game 1: Cocokin kartu ---------- */
function initMatch() {
  const emoji = ["🍓", "🦄", "⭐", "🦊", "🐱", "🐼", "🐨", "🥑", "🍦", "🎈", "🐰", "🌸"];
  const deck = [...emoji, ...emoji].sort(() => Math.random() - 0.5);
  const grid = $("grid");
  grid.innerHTML = "";
  let first = null, lock = false, found = 0;

  deck.forEach((e) => {
    const c = document.createElement("button");
    c.className = "card";
    c.textContent = "?";
    c.addEventListener("click", () => {
      if (lock || c === first || c.classList.contains("done")) return;
      c.textContent = e;
      c.classList.add("open");
      if (!first) { first = c; return; }

      if (first.textContent === e) {
        [first, c].forEach((x) => x.classList.replace("open", "done"));
        first = null;
        if (++found === emoji.length) setTimeout(() => show("s-quiz"), 800);
      } else {
        lock = true;
        const a = first;
        first = null;
        setTimeout(() => {
          [a, c].forEach((x) => { x.textContent = "?"; x.classList.remove("open"); });
          lock = false;
        }, 700);
      }
    });
    grid.appendChild(c);
  });
}

/* ---------- Game 2: Tangkap hati ---------- */
let cg = { run: false };

function initCatch() {
  const arena = $("arena"), basket = $("basket");
  cancelAnimationFrame(cg.raf);
  clearInterval(cg.spawn);
  arena.querySelectorAll(".item").forEach((e) => e.remove());
  $("score").textContent = "0";

  const bw = basket.offsetWidth;
  cg = { run: true, score: 0, items: [], dir: 0, last: 0, x: (arena.clientWidth - bw) / 2 };

  cg.spawn = setInterval(() => {
    const el = document.createElement("span");
    el.className = "item";
    const bom = Math.random() < 0.3;
    el.textContent = bom ? "💣" : "❤️";
    arena.appendChild(el);
    cg.items.push({ el, bom, x: rand(0, arena.clientWidth - 34), y: -34, v: rand(0.12, 0.2) });
  }, 650);

  const loop = (t) => {
    if (!cg.run) return;
    const dt = cg.last ? t - cg.last : 16;
    cg.last = t;
    const W = arena.clientWidth, H = arena.clientHeight;

    cg.x = Math.max(0, Math.min(W - bw, cg.x + cg.dir * 0.45 * dt));
    basket.style.left = cg.x + "px";

    cg.items = cg.items.filter((it) => {
      it.y += it.v * dt;
      it.el.style.transform = `translate(${it.x}px, ${it.y}px)`;
      const kena = it.y + 32 >= H - 44 && it.x + 30 > cg.x && it.x < cg.x + bw;
      if (kena) {
        it.el.remove();
        cg.score = it.bom ? Math.max(0, cg.score - 2) : cg.score + 1;
        $("score").textContent = cg.score;
        if (it.bom) {
          arena.classList.add("hurt");
          setTimeout(() => arena.classList.remove("hurt"), 200);
        }
        if (cg.score >= 10) menangCatch();
        return false;
      }
      if (it.y > H) { it.el.remove(); return false; }
      return true;
    });
    cg.raf = requestAnimationFrame(loop);
  };
  cg.raf = requestAnimationFrame(loop);
}

function menangCatch() {
  cg.run = false;
  clearInterval(cg.spawn);
  setTimeout(() => show("s-choice"), 700);
}

// Kontrol: tombol, geser jari di arena, dan keyboard
const tahan = (id, d) => {
  const b = $(id);
  b.addEventListener("pointerdown", () => (cg.dir = d));
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
    b.addEventListener(ev, () => (cg.dir = 0))
  );
};
tahan("btn-left", -1);
tahan("btn-right", 1);

$("arena").addEventListener("pointermove", (e) => {
  if (!cg.run || e.buttons === 0 && e.pointerType === "mouse") return;
  const r = $("arena").getBoundingClientRect();
  cg.x = Math.max(0, Math.min(r.width - $("basket").offsetWidth, e.clientX - r.left - $("basket").offsetWidth / 2));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") cg.dir = -1;
  if (e.key === "ArrowRight") cg.dir = 1;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") cg.dir = 0;
});

/* ---------- Efek ---------- */
function confetti() {
  const box = $("confetti");
  box.innerHTML = "";
  for (let i = 0; i < 36; i++) {
    const p = document.createElement("i");
    p.style.left = rand(0, 100) + "%";
    p.style.background = PALET[i % PALET.length];
    p.style.animationDuration = rand(2, 4) + "s";
    p.style.animationDelay = rand(0, 1) + "s";
    box.appendChild(p);
  }
}

let hujan;
function rainHearts() {
  const box = $("hearts");
  const simbol = ["💖", "💗", "❤️", "💙", "✨"];
  clearInterval(hujan);
  hujan = setInterval(() => {
    const h = document.createElement("span");
    h.textContent = simbol[Math.floor(Math.random() * simbol.length)];
    h.style.left = rand(0, 92) + "%";
    h.style.fontSize = rand(18, 34) + "px";
    h.style.animationDuration = rand(4, 7) + "s";
    box.appendChild(h);
    setTimeout(() => h.remove(), 7500);
  }, 450);
}

/* ---------- Balas ke WhatsApp ---------- */
document.querySelectorAll(".chip").forEach((c) =>
  c.addEventListener("click", () => ($("balasan").value = c.textContent))
);

$("btn-wa").addEventListener("click", () => {
  const pesan = $("balasan").value.trim() || "Love you too! 💖";
  const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
});
