// Header: entrance after the loader, live local clock, and hover springs on the brand,
// nav labels and Menu button. Clicks are routed in js/overlays.js.
import { $, $$, ready, springEl, hover, CONFIG } from "./engine.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatTime(d) {
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}${d.getHours() < 12 ? "am" : "pm"}`;
}
const formatDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;

function initClock() {
  const update = () => {
    const now = new Date();
    $$('[data-clock="time"]').forEach((el) => { el.textContent = formatTime(now); });
    $$('[data-clock="date"]').forEach((el) => { el.textContent = formatDate(now); });
  };
  update();
  setInterval(update, 1000);
}

export function initHeader() {
  const header = $("#header");
  const enter = springEl(header, { opacity: 0, y: -14 }, CONFIG.header);
  ready.then(() => enter.to({ opacity: 1, y: 0 }, { delay: 150 }));

  initClock();

  const brand = $(".brand");
  hover(brand, brand.firstElementChild, { from: { scale: 1 }, to: { scale: 1.04 } });
  $$(".nav__link").forEach((b) => hover(b, b.firstElementChild, {
    from: { y: 0, opacity: 0.8 }, to: { y: -2, opacity: 1 }, config: { tension: 320, friction: 22 },
  }));
  const menu = $("#menu-open");
  hover(menu, menu.firstElementChild, { from: { scale: 1 }, to: { scale: 1.05 } });
}
