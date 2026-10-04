/**
 * Tutorial motoru: hash yönlendirme (#/05, #/bitti), blokları tek tek açma
 * ve soru kontrolü. İçerik content/tr/levels/ altındaki JSON dosyalarından gelir.
 * İlerleme shared/progress.js ile hero ile aynı kayıtta tutulur.
 */
import { progress } from "../../shared/progress.js";

const BASE = "../../content/tr/levels/";
const REPO_URL = "https://github.com/AU-YAZGIT/uni_101";
const CHECKS = new Set(["choice", "fill", "type", "order"]);
const $ = (s) => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const paras = (s) => s.split("\n\n").map((p) => `<p>${md(p)}</p>`).join("");
const html = (h) => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/['“”‘’]/g, '"');

let data, run = 0, uid = 0;
const total = () => data.levels.length;
const cur = () => progress.read(total() + 1);

/* Yönlendirme ---------------------------------------------------------- */
async function init() {
  try { data = await (await fetch(BASE + "index.json")).json(); }
  catch { $("#content").innerHTML = '<p class="fallback">İçerik yüklenemedi. Sayfayı bir sunucu üzerinden aç (GitHub Pages ya da yerelde <code>python -m http.server</code>).</p>'; return; }
  addEventListener("hashchange", route);
  $("#reset").onclick = () => { if (confirm("İlerleme sıfırlansın mı?")) { progress.write(1); location.hash = "#/01"; route(); } };
  $("#menu").onclick = () => drawer(!$("#sidebar").classList.contains("is-open"));
  $("#scrim").onclick = () => drawer(false);
  route();
}

function drawer(open) {
  $("#sidebar").classList.toggle("is-open", open);
  $("#scrim").hidden = !open;
  $("#menu").setAttribute("aria-expanded", open);
}

function route() {
  drawer(false);
  const m = location.hash.match(/^#\/(\d+|bitti)$/);
  const level = m && data.levels.find((l) => l.id === m[1]);
  if (m && m[1] === "bitti") return showFinish();
  if (!level) { const v = cur(); return location.replace(v > total() ? "#/bitti" : "#/" + String(v).padStart(2, "0")); }
  showLevel(level);
}

/* Sidebar (git grafiği) -------------------------------------------------- */
function renderNav(activeId) {
  const c = cur();
  $("#nav").innerHTML = data.sections.map((s, si) => {
    const items = data.levels.map((l, i) => ({ l, n: i + 1 })).filter((x) => x.l.section === s.id).map(({ l, n }) => {
      const state = n < c ? "is-done" : n === c ? "is-cur" : "";
      const active = l.id === activeId ? ' aria-current="step"' : "";
      return `<li class="${state}"><a class="graph__commit" href="#/${l.id}"${active}><span class="graph__dot" aria-hidden="true">${n < c ? "✓" : ""}</span><span>${n}. ${esc(l.title)}${n < c ? '<span class="sr"> (tamamlandı)</span>' : ""}</span></a></li>`;
    }).join("");
    return `<section class="graph branch-${si}"><h2 class="graph__branch">${esc(s.title)}</h2><ol>${items}</ol></section>`;
  }).join("");
}

function setBar(n) {
  const pct = Math.round((n / total()) * 100);
  $("#bar").style.width = pct + "%";
  $("#barwrap").setAttribute("aria-valuenow", pct);
}

/* Seviye ---------------------------------------------------------------- */
async function showLevel(level) {
  const my = ++run;
  const n = data.levels.indexOf(level) + 1;
  const si = data.sections.findIndex((s) => s.id === level.section);
  const wasDone = n < cur();
  renderNav(level.id); setBar(n);
  document.title = `${level.title} | Adım Adım Git`;
  $("#topbar-title").textContent = `${n} / ${total()}`;
  $("#lessonnav").hidden = false;
  $("#content").innerHTML = `<p class="lesson__kicker branch-${si}">${esc(data.sections[si].title)} · ${n}. adım</p><h1 tabindex="-1">${esc(level.title)}</h1><div id="blocks"></div>`;

  const prev = $("#prev"), next = $("#next");
  prev.hidden = n === 1;
  prev.href = "#/" + (data.levels[n - 2]?.id ?? "01");

  let blocks;
  try { blocks = (await (await fetch(BASE + level.file)).json()).blocks; }
  catch { blocks = [{ type: "note", kind: "dikkat", body: "Bu adım henüz hazır değil." }]; }
  if (my !== run) return; // kullanıcı bu sırada başka seviyeye geçti

  const wrap = $("#blocks");
  let i = 0;
  const setNext = (label, fn, disabled = false) => { next.textContent = label; next.disabled = disabled; next.onclick = fn; };

  // Kullanıcı bir şey açtığında sayfayı yeni içeriğe kaydırır.
  // Yeni içerik kısaysa sayfanın sonuna (düğmeye) iner, uzunsa başlangıcına gider.
  function advance(user) {
    const before = wrap.children.length;
    step();
    const first = wrap.children[before];
    if (user !== true || !first) return;
    requestAnimationFrame(() => {
      const behavior = reduce ? "auto" : "smooth";
      const span = wrap.lastElementChild.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
      if (span > innerHeight * 0.7) first.scrollIntoView({ block: "start", behavior });
      else scrollTo({ top: document.documentElement.scrollHeight, behavior });
    });
  }

  function step() {
    while (i < blocks.length) {
      const b = blocks[i++];
      if (b.type === "gate") {
        if (wasDone) continue;
        return setNext("Anladım, devam et", () => advance(true));
      }
      const node = renderBlock(b, si, () => advance(true));
      if (i > 1 || !wasDone) node.classList.add("reveal");
      wrap.append(node);
      if (CHECKS.has(b.type) && !wasDone) return setNext("Önce soruyu yanıtla", null, true);
    }
    // Seviye bitti
    if (n === cur()) { progress.write(n + 1); renderNav(level.id); }
    const last = n === total();
    setNext(last ? "Bitir" : "Sonraki adım →", () => { location.hash = last ? "#/bitti" : "#/" + data.levels[n].id; });
  }
  advance();
  $("#lesson h1").focus({ preventScroll: true });
  scrollTo(0, 0);
}

function showFinish() {
  ++run;
  renderNav(""); setBar(total());
  document.title = "Tebrikler | Adım Adım Git";
  $("#topbar-title").textContent = "Bitti";
  $("#lessonnav").hidden = true;
  $("#content").innerHTML = `<div class="finish"><h1 tabindex="-1">Rehberi bitirdin 🎉</h1>
    <p>Artık Git'in temelini, fork ile clone farkını, issue ve pull request adabını biliyorsun. Sıra gerçek bir katkıda: topluluğun <strong>uni_101</strong> reposuna ilk pull request'ini aç.</p>
    <p><a class="button" href="${REPO_URL}">uni_101 reposuna git</a> <a class="button button--secondary" href="#/01">Başa dön</a></p></div>`;
  $("#content h1").focus({ preventScroll: true });
}

/* Bloklar --------------------------------------------------------------- */
function renderBlock(b, si, solved) {
  switch (b.type) {
    case "text": return html(`<div>${paras(b.body)}</div>`);
    case "code": {
      const el = html(`<div class="code"><pre><code>${esc(b.body)}</code></pre><button class="button button--secondary code__copy" type="button">Kopyala</button></div>`);
      const btn = el.querySelector("button");
      btn.onclick = async () => { try { await navigator.clipboard.writeText(b.body); btn.textContent = "Kopyalandı"; } catch { btn.textContent = "Kopyalanamadı"; } setTimeout(() => (btn.textContent = "Kopyala"), 1500); };
      return el;
    }
    case "note": return html(`<aside class="note note--${b.kind || "ipucu"} branch-${si}"><p><strong>${b.kind === "dikkat" ? "Dikkat" : "İpucu"}:</strong> ${md(b.body)}</p></aside>`);
    default: return quiz(b, si, solved);
  }
}

function quiz(b, si, solved) {
  const id = "q" + ++uid;
  const el = html(`<section class="quiz branch-${si}"><p class="quiz__q">${md(b.question)}</p><div class="quiz__body"></div><button class="button" type="button">Kontrol et</button><p class="quiz__result" role="status"></p></section>`);
  const body = el.querySelector(".quiz__body"), btn = el.querySelector("button.button"), out = el.querySelector(".quiz__result");
  let verify, lock;

  if (b.type === "choice") {
    body.innerHTML = `<fieldset><legend class="sr">Seçenekler</legend>${b.options.map((o, k) => `<label><input type="radio" name="${id}" value="${k}"> <span>${md(o)}</span></label>`).join("")}</fieldset>`;
    verify = () => { const c = body.querySelector("input:checked"); return c ? +c.value === b.answer : null; };
    lock = () => body.querySelectorAll("input").forEach((x) => (x.disabled = true));
  } else if (b.type === "fill" || b.type === "type") {
    const [pre, post = ""] = (b.template ?? "$ ___").split("___");
    body.innerHTML = `<div class="quiz__line"><span>${esc(pre)}</span><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Cevabın" size="${b.size || 12}"><span>${esc(post)}</span></div>`;
    const inp = body.querySelector("input");
    inp.onkeydown = (e) => { if (e.key === "Enter") btn.click(); };
    verify = () => (inp.value.trim() ? b.answers.some((a) => norm(a) === norm(inp.value)) : null);
    lock = () => (inp.disabled = true);
  } else if (b.type === "order") {
    const picked = [];
    const items = b.items.map((t, k) => [t, k]).sort(() => Math.random() - 0.5);
    body.innerHTML = `<p>Komutları doğru sırayla seç:</p><div class="quiz__pool"></div><ol class="quiz__seq" aria-label="Seçtiğin sıra"></ol><button class="button button--secondary" type="button">Seçimi temizle</button>`;
    const pool = body.querySelector(".quiz__pool"), seq = body.querySelector(".quiz__seq");
    const draw = () => {
      pool.innerHTML = ""; seq.innerHTML = "";
      items.forEach(([t, k]) => { if (!picked.includes(k)) { const c = html(`<button class="chip" type="button">${esc(t)}</button>`); c.onclick = () => { picked.push(k); draw(); }; pool.append(c); } });
      picked.forEach((k) => seq.append(html(`<li><code>${esc(b.items[k])}</code></li>`)));
    };
    body.querySelector("button.button").onclick = () => { picked.length = 0; draw(); };
    draw();
    verify = () => (picked.length === b.items.length ? picked.every((k, p) => k === p) : null);
    lock = () => body.querySelectorAll("button").forEach((x) => (x.disabled = true));
  }

  btn.onclick = () => {
    const r = verify();
    out.className = "quiz__result";
    if (r === null) { out.textContent = "Önce bir yanıt ver."; return; }
    if (!r) { out.classList.add("no"); out.textContent = "✗ Tam değil. " + (b.hint || "Bir daha dene."); return; }
    out.classList.add("ok"); out.textContent = "✓ Doğru! " + (b.explain || "");
    el.classList.add("is-solved"); btn.hidden = true; lock();
    solved();
  };
  return el;
}

init();