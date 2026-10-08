// LiquidReveal — the hero's before/after brush. The base <img> (hero/after.jpg) is always shown;
// moving the pointer paints a soft trail of hero/before.jpg onto a canvas above it, which decays
// each frame and is hard-cleared after 120 idle frames.
import { REDUCED } from "./engine.js";
import { loadImage, watchImg } from "./config.js";

const BRUSH_RADIUS = 143;      // CSS px
const DECAY = 0.016;           // trail alpha removed per frame while drawing
const FADE_FRAMES = 120;       // idle frames before the canvas is cleared
const MAX_POINTS = 60;         // interpolated points per pointer move

export async function initLiquid(container) {
  const base = container.querySelector(".liquid__base");
  const canvas = container.querySelector(".liquid__canvas");
  watchImg(base);
  if (REDUCED) { canvas.remove(); return; }

  let after;
  try { after = await loadImage("hero/before.jpg"); }   // the brush-revealed image
  catch { canvas.remove(); return; }

  const ctx = canvas.getContext("2d");
  const cover = document.createElement("canvas");
  const coverCtx = cover.getContext("2d");
  const brush = document.createElement("canvas");
  const brushCtx = brush.getContext("2d");

  let dpr = 1, radius = 0, diam = 0;
  let points = [];
  let last = null;
  let idle = FADE_FRAMES + 1;

  function measure() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // object-fit: cover copy of the revealed image at canvas resolution
    cover.width = canvas.width;
    cover.height = canvas.height;
    const scale = Math.max(cover.width / after.naturalWidth, cover.height / after.naturalHeight);
    const w = after.naturalWidth * scale, h = after.naturalHeight * scale;
    coverCtx.drawImage(after, (cover.width - w) / 2, (cover.height - h) / 2, w, h);

    radius = BRUSH_RADIUS * dpr;
    diam = Math.ceil(radius * 2);
    brush.width = brush.height = diam;
    last = null;
  }
  measure();
  new ResizeObserver(measure).observe(container);

  addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    if (x < -radius || y < -radius || x > canvas.width + radius || y > canvas.height + radius) { last = null; return; }
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(radius * 0.3, 1);
      const n = Math.min(Math.ceil(dist / step), MAX_POINTS);
      for (let i = 1; i <= n; i++) points.push({ x: last.x + (dx * i) / n, y: last.y + (dy * i) / n });
    } else {
      points.push({ x, y });
    }
    last = { x, y };
  }, { passive: true });

  function stamp(x, y) {
    const c = diam / 2;
    brushCtx.clearRect(0, 0, diam, diam);
    brushCtx.globalCompositeOperation = "source-over";
    const g = brushCtx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,.82)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    brushCtx.fillStyle = g;
    brushCtx.fillRect(0, 0, diam, diam);
    brushCtx.globalCompositeOperation = "source-in";
    brushCtx.drawImage(cover, x - c, y - c, diam, diam, 0, 0, diam, diam);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(brush, x - c, y - c);
  }

  function tick() {
    requestAnimationFrame(tick);
    const drawing = points.length > 0;
    if (drawing) idle = 0;
    else if (++idle > FADE_FRAMES) return;

    const fade = drawing ? DECAY : Math.min(DECAY + idle * 0.004, 0.5);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (drawing) {
      for (const p of points) stamp(p.x, p.y);
      points = [];
    } else if (idle === FADE_FRAMES) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(tick);
}
