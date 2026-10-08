// Intro loader: counts 000 → 100 over 1300ms (easeInOutCubic), then the dark panel slides up.
// When it's gone the intro is "ready": scroll unlocks and the hero reveals start.
import { $, Spring, springEl, stopScroll, startScroll, setReady, REDUCED } from "./engine.js";

const FILL_MS = 1300;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initLoader() {
  const root = $("#loader");
  const fill = $("#loader-fill");
  const count = $("#loader-count");
  const center = $("#loader-center");

  stopScroll();

  const finish = () => {
    root.remove();
    startScroll();
    setReady();
  };

  if (REDUCED) {
    count.textContent = "100";
    fill.style.width = "100%";
    setTimeout(finish, 200);
    return;
  }

  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / FILL_MS);
    const progress = Math.round(easeInOutCubic(t) * 100);
    fill.style.width = `${progress}%`;
    count.textContent = String(progress).padStart(3, "0");
    if (t < 1) requestAnimationFrame(tick);
    else exit();
  };
  requestAnimationFrame(tick);

  function exit() {
    springEl(center, { opacity: 1, y: 0 }, { tension: 260, friction: 26 }).to({ opacity: 0, y: -12 });
    new Spring({ y: 0 }, { tension: 220, friction: 30 }, (v) => {
      root.style.transform = `translateY(${v.y}%)`;
    }).to({ y: -100 }, { onRest: finish });
  }
}
