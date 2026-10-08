// Hero: the liquid before/after background, entrances gated on the loader, the headline lines,
// the highlight carousel card and the partner list.
import { $, $$, ready, Spring, springEl, hover, styler, CONFIG } from "./engine.js";
import { lines } from "./text.js";
import { initLiquid } from "./liquid.js";

const HIGHLIGHTS = [
  { caption: "Conversion design", title: "Crafted to convert." },
  { caption: "Engineering", title: "Built to scale." },
  { caption: "Brand systems", title: "Designed to last." },
];

/* ---------- Entrances (ms after the loader leaves) ---------- */
function initEntrances() {
  const piece = (name) => $(`[data-hero="${name}"]`);
  const plan = [
    { el: piece("eyebrow"), from: { opacity: 0, y: 10 }, delay: 200, config: CONFIG.header },
    { el: piece("card"), from: { opacity: 0, y: 16, scale: 0.96 }, delay: 400, config: CONFIG.reveal },
    { el: piece("partners"), from: { opacity: 0, y: 14 }, delay: 550, config: CONFIG.reveal },
    { el: piece("rating"), from: { opacity: 0, y: 10 }, delay: 650, config: CONFIG.header },
    { el: piece("ctas"), from: { opacity: 0, y: 10 }, delay: 750, config: CONFIG.header },
    { el: piece("status"), from: { opacity: 0 }, delay: 900, config: CONFIG.header },
  ];
  const springs = plan.map((p) => ({ ...p, s: springEl(p.el, p.from, p.config) }));

  const watermark = springEl($("#hero-watermark"), { opacity: 0, y: 20 }, { tension: 120, friction: 30 });
  const title = lines($("#hero-title"), { stagger: 120, base: 250, duration: 900 });

  ready.then(() => {
    springs.forEach(({ s, from, delay }) => {
      const to = {};
      for (const k in from) to[k] = k === "opacity" || k === "scale" ? 1 : 0;
      s.to(to, { delay });
    });
    watermark.to({ opacity: 0.4, y: 0 }, { delay: 300 });
    title.play();
  });
}

/* ---------- Highlight card: click / next advances, prev goes back, wraps ---------- */
function initCard() {
  const row = $("#hcard");
  const slot = $("#hcard-slot");
  const dotsBox = $("#hcard-dots");
  const n = HIGHLIGHTS.length;
  let index = 0;

  const dots = HIGHLIGHTS.map(() => dotsBox.appendChild(document.createElement("span")));
  const make = (item) => {
    const el = document.createElement("div");
    el.className = "hcard__item";
    el.innerHTML = `<span class="hcard__cap">${item.caption}</span><span class="hcard__name">${item.title}</span>`;
    slot.append(el);
    return el;
  };
  let current = make(HIGHLIGHTS[0]);
  const paint = () => dots.forEach((d, i) => d.classList.toggle("on", i === index));
  paint();

  const go = (step) => {
    index = (index + step + n) % n;
    paint();
    const outgoing = current;
    const config = { tension: 300, friction: 28 };
    new Spring({ opacity: 1, y: 0 }, config, styler(outgoing))
      .to({ opacity: 0, y: -14 * step }, { onRest: () => outgoing.remove() });
    current = make(HIGHLIGHTS[index]);
    new Spring({ opacity: 0, y: 14 * step }, config, styler(current)).to({ opacity: 1, y: 0 });
  };

  row.addEventListener("click", () => go(1));
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(1); }
  });
  $("#hcard-next").addEventListener("click", (e) => { e.stopPropagation(); go(1); });
  $("#hcard-prev").addEventListener("click", (e) => { e.stopPropagation(); go(-1); });
}

export function initHero() {
  initLiquid($("#liquid"));
  initEntrances();
  initCard();
  $$(".partner").forEach((p) => hover(p, p, {
    from: { y: 0, opacity: 0.7 }, to: { y: -2, opacity: 1 }, config: { tension: 320, friction: 20 },
  }));
}
