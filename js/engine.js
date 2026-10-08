// Engine — adaptive rem scale-up, Lenis + scroll lock, the loader → hero hand-over, a shared
// rAF ticker, a react-spring-style spring, and the in-view / hover helpers built on it.
import Lenis from "lenis";

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Adaptive grid: media queries scale down, this scales up above 1920px ---------- */
const FONT_BASE = 16, BASE_W = 1920, COEF = 0.6666;
function applyAdaptiveGrid() {
  const widthReduction = ((BASE_W - innerWidth) / BASE_W) * 100;   // negative when wider than 1920
  const size = FONT_BASE - (FONT_BASE * (widthReduction * COEF)) / 100;
  if (size > FONT_BASE) document.documentElement.style.fontSize = size + "px";
  else document.documentElement.style.removeProperty("font-size");  // media queries drive it
}
applyAdaptiveGrid();
addEventListener("resize", applyAdaptiveGrid);

/* ---------- Lenis smooth scroll (starts at the top on every load) ---------- */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
export const lenis = new Lenis({ smoothWheel: true });
function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ---------- Scroll lock: loader, menu and modal each hold one lock ---------- */
let locks = 0;
export function stopScroll() {
  locks += 1;
  lenis.stop();
  document.documentElement.classList.add("locked");
}
export function startScroll() {
  locks = Math.max(0, locks - 1);
  if (locks) return;
  lenis.start();
  document.documentElement.classList.remove("locked");
}

/** Smooth-scroll to an element by id (logo, nav links, "View Work"). Missing ids do nothing. */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => lenis.scrollTo(el.getBoundingClientRect().top + pageYOffset), 50);
}

/* ---------- Intro hand-over: hero reveals wait for the loader to leave ---------- */
let resolveReady;
export const ready = new Promise((r) => { resolveReady = r; });
export const setReady = () => resolveReady();

/* ---------- Hover springs are a pointer affordance: off on touch ---------- */
const hoverQ = matchMedia("(hover: hover) and (pointer: fine)");
export const hoverEnabled = () => hoverQ.matches;

/* ---------- Shared ticker ---------- */
const subs = new Set();
let rafId = 0;
function loop(t) {
  rafId = 0;
  for (const fn of [...subs]) fn(t);
  if (subs.size) rafId = requestAnimationFrame(loop);
}
export function subscribe(fn) {
  subs.add(fn);
  if (!rafId) rafId = requestAnimationFrame(loop);
  return () => subs.delete(fn);
}

/* ---------- Spring: accel = tension*(target-x) - friction*v, mass 1, 1 ms substeps ---------- */
export class Spring {
  constructor(from, config, apply) {
    this.x = { ...from };
    this.t = { ...from };
    this.v = {};
    for (const k in from) this.v[k] = 0;
    this.config = config;
    this.apply = apply;
    this.timer = 0;
    this.unsub = null;
    this.onRest = null;
    apply(this.x);
  }
  to(target, { delay = 0, config, onRest } = {}) {
    clearTimeout(this.timer);
    const go = () => {
      if (config) this.config = config;
      if (onRest) this.onRest = onRest;
      Object.assign(this.t, target);
      this.run();
    };
    if (delay > 0) this.timer = setTimeout(go, delay);
    else go();
    return this;
  }
  set(values) {
    clearTimeout(this.timer);
    Object.assign(this.x, values);
    Object.assign(this.t, values);
    for (const k in values) this.v[k] = 0;
    this.apply(this.x);
    return this;
  }
  run() {
    if (this.unsub) return;
    this.last = performance.now();
    this.unsub = subscribe(() => this.step());
  }
  step() {
    const now = performance.now();
    const ms = Math.round(Math.min(64, now - this.last));
    this.last = now;
    const { tension, friction } = this.config;
    let done = true;
    for (const k in this.t) {
      const target = this.t[k];
      let x = this.x[k], v = this.v[k];
      for (let i = 0; i < ms; i++) {
        v += (tension * (target - x) - friction * v) * 0.001;
        x += v * 0.001;
      }
      const precision = k === "opacity" || k === "scale" || k === "a" ? 0.001 : 0.01;
      if (Math.abs(target - x) < precision && Math.abs(v) < precision * 10) { x = target; v = 0; }
      else done = false;
      this.x[k] = x;
      this.v[k] = v;
    }
    this.apply(this.x);
    if (done && this.unsub) {
      this.unsub();
      this.unsub = null;
      const cb = this.onRest;
      this.onRest = null;
      cb?.();
    }
  }
}

/** Write {opacity, x, y, scale, rotate} onto an element (x/y px, rotate deg). */
export function styler(el) {
  return (v) => {
    if ("opacity" in v) el.style.opacity = v.opacity;
    const parts = [];
    if ("x" in v || "y" in v) parts.push(`translate3d(${v.x || 0}px, ${v.y || 0}px, 0)`);
    if ("scale" in v) parts.push(`scale(${v.scale})`);
    if ("rotate" in v) parts.push(`rotate(${v.rotate}deg)`);
    if (parts.length) el.style.transform = parts.join(" ");
  };
}
export const springEl = (el, from, config) => new Spring(from, config, styler(el));

/* ---------- Reveal + hover helpers ---------- */
export const CONFIG = {
  header: { tension: 210, friction: 26 },
  reveal: { tension: 200, friction: 24 },
  hover: { tension: 320, friction: 18 },
};

/** Spring from → to the first time the element scrolls into view (plays once). */
export function inview(el, { from, to, delay = 0, config = CONFIG.reveal }) {
  if (REDUCED) { springEl(el, to, config); return; }
  const s = springEl(el, from, config);
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    s.to(to, { delay });
  }, { rootMargin: "0px 0px -8% 0px" });
  io.observe(el);
  return s;
}

/** Spring `target` to `to` while the pointer is over `trigger`, back to `from` when it leaves. */
export function hover(trigger, target, { from, to, config = CONFIG.hover, apply }) {
  const s = new Spring(from, config, apply || styler(target));
  trigger.addEventListener("pointerenter", () => { if (hoverEnabled()) s.to(to); });
  trigger.addEventListener("pointerleave", () => s.to(from));
  return s;
}

/** Every [data-reveal="y:12"] block: fade + rise when first in view (data-delay, data-config="t,f"). */
export function autoReveal(root = document) {
  $$("[data-reveal]", root).forEach((el) => {
    const y = Number((el.dataset.reveal.match(/y:(-?\d+)/) || [])[1] || 0);
    const [tension, friction] = (el.dataset.config || "200,24").split(",").map(Number);
    inview(el, { from: { opacity: 0, y }, to: { opacity: 1, y: 0 }, delay: Number(el.dataset.delay) || 0, config: { tension, friction } });
  });
}
