// Sections below the hero: About word reveal, Portfolio cards, Services rows and the Stats
// panel with its scroll-driven count-up.
import { $, $$, lenis, inview, hover, clamp01 } from "./engine.js";
import { words, onFirstView } from "./text.js";

const icon = (id) => `<svg class="ic"><use href="#${id}"/></svg>`;

const WORKS = [
  { name: "Aster Labs", category: "Branding", year: 2025, desc: "A complete identity and go-to-market system for a fast-moving research startup.", tags: ["Branding", "Strategy", "Design"] },
  { name: "Nova Finance", category: "Product", year: 2024, desc: "A finance platform reimagined — clear data, calm interfaces, and effortless flows.", tags: ["Product Design", "Web App", "QA"] },
  { name: "Helio Studio", category: "Identity", year: 2023, desc: "A bold visual identity and art direction system built to scale across every surface.", tags: ["Brand Identity", "Art Direction"] },
  { name: "Pulse Health", category: "Mobile", year: 2023, desc: "A wellness app grounded in research, shipped end to end from concept to release.", tags: ["Mobile App", "UX Research", "Development"] },
];

const SERVICES = [
  { title: "Software Development", desc: "Scalable web & mobile products built to last.", href: "#development" },
  { title: "Product Design", desc: "Interfaces that feel effortless and look sharp.", href: "#design" },
  { title: "Quality Assurance", desc: "Rigorous testing for flawless, confident releases.", href: "#qa" },
  { title: "Consulting", desc: "Strategy and direction for ambitious teams.", href: "#consulting" },
];

const STATS = [
  { value: 150, suffix: "+", label: "Projects delivered" },
  { value: 98, suffix: "%", label: "Client retention" },
  { value: 12, suffix: "", label: "Years of craft" },
  { value: 40, suffix: "+", label: "Team members" },
];

function initAbout() {
  const title = $("#about-title");
  onFirstView(title, words(title, { stagger: 35 }).play);
}

function initWorks() {
  const grid = $("#works-grid");
  grid.innerHTML = WORKS.map((w) => `
    <li>
      <a href="#works" class="work-link" aria-label="${w.name} — ${w.category}, ${w.year}">
        <article class="work">
          <div class="work__meta"><span>${w.category} — ${w.year}</span><span class="work__badge">${icon("i-arrow-ur")}</span></div>
          <div class="work__mark" aria-hidden="true"><span class="work__mark-in">${icon("i-logo")}<small>®</small></span></div>
          <div class="work__body">
            <h3 class="work__name">${w.name}</h3>
            <p class="work__desc">${w.desc}</p>
            <div class="work__tags">${w.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
          </div>
        </article>
      </a>
    </li>`).join("");

  $$("li", grid).forEach((li, i) => {
    inview(li, { from: { opacity: 0, y: 48 }, to: { opacity: 1, y: 0 }, delay: i * 90, config: { tension: 180, friction: 26 } });
    const link = li.firstElementChild;
    const card = $(".work", li);
    link.addEventListener("click", (e) => e.preventDefault());
    hover(link, card, { from: { y: 0, scale: 1 }, to: { y: -8, scale: 1.012 }, config: { tension: 260, friction: 22 } });
    hover(link, $(".work__badge", li), { from: { rotate: 0, scale: 1 }, to: { rotate: 45, scale: 1.08 }, config: { tension: 280, friction: 18 } });
  });
}

function initServices() {
  const list = $("#services-list");
  list.innerHTML = SERVICES.map((s, i) => `
    <li>
      <a href="${s.href}" class="service">
        <span class="service__idx">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="service__name">${s.title}</h3>
        <p class="service__desc">${s.desc}</p>
        <span class="service__badge">${icon("i-arrow-ur")}</span>
      </a>
    </li>`).join("");

  $$("li", list).forEach((li, i) => {
    inview(li, { from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, delay: i * 80 });
    const row = li.firstElementChild;
    row.addEventListener("click", (e) => e.preventDefault());
    // The row fills with the surface colour and its padding shifts right
    hover(row, row, {
      from: { a: 0, pl: 1.5, pr: 1.5 }, to: { a: 1, pl: 2, pr: 1.25 }, config: { tension: 240, friction: 26 },
      apply: (v) => {
        row.style.backgroundColor = `rgba(241,240,238,${v.a})`;
        row.style.paddingLeft = `${v.pl}rem`;
        row.style.paddingRight = `${v.pr}rem`;
      },
    });
    hover(row, $(".service__badge", li), { from: { x: 0 }, to: { x: 5 }, config: { tension: 300, friction: 18 } });
  });
}

function initStats() {
  inview($("#stats-panel"), { from: { opacity: 0, y: 40, scale: 0.99 }, to: { opacity: 1, y: 0, scale: 1 }, config: { tension: 180, friction: 26 } });

  const grid = $("#stats-grid");
  grid.innerHTML = STATS.map((s) => `
    <li>
      <p class="stat__num" aria-label="${s.value}${s.suffix}"><span data-count="${s.value}">0</span>${s.suffix}</p>
      <p class="stat__label">${s.label}</p>
    </li>`).join("");
  $$("li", grid).forEach((li, i) => inview(li, { from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, delay: i * 90 }));

  // Count-up: 0 when the number's top meets the viewport bottom, full when its centre meets the viewport centre
  const nums = $$("[data-count]", grid);
  let lastRun = 0, queued = false;
  const update = () => {
    queued = false;
    lastRun = performance.now();
    const vh = innerHeight;
    nums.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const progress = clamp01((vh - r.top) / (vh / 2 + r.height / 2));
      el.textContent = Math.round(progress * Number(el.dataset.count));
    });
  };
  const throttled = () => {
    if (queued) return;
    const wait = Math.max(0, 30 - (performance.now() - lastRun));
    queued = true;
    setTimeout(update, wait);
  };
  lenis.on("scroll", throttled);
  addEventListener("scroll", throttled, { passive: true });
  addEventListener("resize", throttled);
  update();
}

export function initSections() {
  initAbout();
  initWorks();
  initServices();
  initStats();
}
