// Shared components: pill buttons (built from a label + data-arrow) and animated links,
// each with its hover spring.
import { $$, hover, CONFIG } from "./engine.js";

const icon = (id) => `<svg class="ic"><use href="#${id}"/></svg>`;

/** Turn every .pill into label + optional arrow badge, and wire its springs. */
export function initPills(root = document) {
  $$(".pill", root).forEach((pill) => {
    if (pill.querySelector(".pill__in")) return;
    const label = pill.textContent.trim();
    const arrow = pill.dataset.arrow;                     // "right" | "up-right" | undefined
    pill.innerHTML = `<span class="pill__in"><span class="pill__label">${label}</span>${
      arrow ? `<span class="pill__badge"><span class="pill__icon">${icon(arrow === "up-right" ? "i-arrow-ur" : "i-arrow")}</span></span>` : ""
    }</span>`;
    hover(pill, pill.querySelector(".pill__in"), { from: { scale: 1 }, to: { scale: 1.04 }, config: CONFIG.hover });
    const ic = pill.querySelector(".pill__icon");
    if (ic) {
      const to = arrow === "up-right" ? { x: 2, y: -2 } : { x: 3, y: 0 };
      hover(pill, ic, { from: { x: 0, y: 0 }, to, config: CONFIG.hover });
    }
  });
}

/** Set a pill's label text (e.g. "Sending…") without rebuilding it. */
export const setPillLabel = (pill, text) => { pill.querySelector(".pill__label").textContent = text; };

/** Footer links: the label nudges right and brightens. */
export function initLinks(root = document) {
  $$(".alink", root).forEach((a) => {
    const legal = a.classList.contains("alink--legal");
    hover(a, a.firstElementChild, {
      from: { x: 0, opacity: legal ? 0.7 : 0.65 },
      to: { x: legal ? 3 : 4, opacity: 1 },
      config: { tension: 320, friction: 22 },
    });
  });
}

/** Small hover springs that don't belong to one section. */
export function initMicroHovers() {
  // About social chips: the icon pops
  $$(".social").forEach((s) => hover(s, s.firstElementChild, { from: { scale: 1 }, to: { scale: 1.18 }, config: { tension: 320, friction: 16 } }));
  // We / Build / → / Better tiles
  $$(".band__tile").forEach((t) => hover(t, t, { from: { scale: 1 }, to: { scale: 1.03 }, config: { tension: 300, friction: 18 } }));
}
