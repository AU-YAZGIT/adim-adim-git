/**
 * Hero arka planı: ekranda rastgele rotalarda yürüyen ayak izleri.
 * Rotalar: düz çizgi, dalgalı çizgi ve daire. İzler yavaşça kaybolur.
 * Renkler yalnızca sarı tonlarıdır ve shared/tokens.css'teki --yellow-* değerlerinden okunur.
 * "Hareketi azalt" ayarı açıksa animasyon hiç başlamaz.
 */

const TAU = Math.PI * 2;
const MAX_WALKERS = 3;
const SPEED = 110;          // piksel/saniye
const STEP_GAP = 36;        // iki iz arası mesafe (piksel)
const SIDE_OFFSET = 8;      // sol/sağ ayak yol çizgisinden sapması
const LIFE = 4500;          // bir izin görünür kalma süresi (ms)
const MAX_ALPHA = 0.55;     // sarı beyaz üstünde soluk durur, bu yüzden biraz yüksek

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Tokenlardaki sarı tonlarını okur (300 beyaz üstünde çok soluk kalır, 400'den başlanır). */
function readYellowShades() {
  const styles = getComputedStyle(document.documentElement);
  return [400, 500, 600, 700]
    .map((n) => styles.getPropertyValue(`--yellow-${n}`).trim())
    .filter(Boolean);
}

/** Ekran kenarındaki rastgele bir nokta. */
function edgePoint(w, h, margin = 40) {
  const side = pick(["top", "bottom", "left", "right"]);
  if (side === "top") return { side, x: rand(0, w), y: -margin };
  if (side === "bottom") return { side, x: rand(0, w), y: h + margin };
  if (side === "left") return { side, x: -margin, y: rand(0, h) };
  return { side, x: w + margin, y: rand(0, h) };
}

/** Her rota { length, at(s) } döner: s, başlangıçtan alınan yoldur (piksel). */
const routes = {
  line(w, h) {
    const a = edgePoint(w, h);
    let b = edgePoint(w, h);
    while (b.side === a.side) b = edgePoint(w, h);
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    return { length, at: (s) => ({ x: a.x + ((b.x - a.x) * s) / length, y: a.y + ((b.y - a.y) * s) / length }) };
  },

  wave(w, h) {
    const line = routes.line(w, h);
    const p0 = line.at(0);
    const p1 = line.at(line.length);
    const nx = -(p1.y - p0.y) / line.length;
    const ny = (p1.x - p0.x) / line.length;
    const amplitude = rand(40, 90);
    const wavelength = rand(220, 360);
    return {
      length: line.length,
      at(s) {
        const base = line.at(s);
        const offset = amplitude * Math.sin((s / wavelength) * TAU);
        return { x: base.x + nx * offset, y: base.y + ny * offset };
      },
    };
  },

  circle(w, h) {
    const r = rand(80, Math.min(220, Math.min(w, h) / 2.5));
    const cx = rand(r, Math.max(r, w - r));
    const cy = rand(r, Math.max(r, h - r));
    const start = rand(0, TAU);
    const dir = pick([1, -1]);
    const turns = rand(1, 1.6);
    return {
      length: r * TAU * turns,
      at(s) {
        const angle = start + dir * (s / r);
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      },
    };
  },
};

export function startStepsBackground(canvas) {
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const colors = readYellowShades();
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  /** @type {{x:number,y:number,angle:number,color:string,born:number}[]} */
  let prints = [];
  /** @type {{route:object,color:string,s:number,nextStep:number,side:number}[]} */
  let walkers = [];

  function spawn() {
    const route = routes[pick(Object.keys(routes))](w, h);
    walkers.push({ route, color: pick(colors), s: 0, nextStep: 0, side: pick([1, -1]) });
  }

  function advance(walker, now, dt) {
    walker.s += SPEED * dt;
    while (walker.nextStep <= walker.s && walker.nextStep <= walker.route.length) {
      const p = walker.route.at(walker.nextStep);
      const ahead = walker.route.at(walker.nextStep + 1);
      const angle = Math.atan2(ahead.y - p.y, ahead.x - p.x);
      walker.side *= -1; // sol ayak, sağ ayak, sol ayak...
      prints.push({
        x: p.x - Math.sin(angle) * SIDE_OFFSET * walker.side,
        y: p.y + Math.cos(angle) * SIDE_OFFSET * walker.side,
        angle,
        color: walker.color,
        born: now,
      });
      walker.nextStep += STEP_GAP;
    }
  }

  /** Bir ayak izi: büyük bir ön taban ve küçük bir topuk. */
  function drawPrint(p, alpha) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(4, 0, 8, 5.5, 0, 0, TAU);
    ctx.ellipse(-9, 0, 4.5, 4, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); // sekme arka plandan dönünce zıplamasın
    last = now;

    while (walkers.length < MAX_WALKERS) spawn();
    walkers.forEach((walker) => advance(walker, now, dt));
    walkers = walkers.filter((walker) => walker.s < walker.route.length);
    prints = prints.filter((p) => now - p.born < LIFE);

    ctx.clearRect(0, 0, w, h);
    prints.forEach((p) => drawPrint(p, MAX_ALPHA * (1 - (now - p.born) / LIFE)));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}