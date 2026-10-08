// Text reveals (in place of spring-text-engine). Both play once; each keeps a visually hidden
// plain copy of the text for screen readers.
//  - lines: every line in an overflow clip, sliding up from 100% (easeOutCubic, 900ms)
//  - words: every word rising 24px with a fade (easeOutQuart, 700ms, 35ms stagger)
import { $$ } from "./engine.js";

const span = (cls) => {
  const s = document.createElement("span");
  if (cls) s.className = cls;
  return s;
};
const srOnly = (text) => {
  const s = span("sr-only");
  s.textContent = text;
  return s;
};

/** Split text into the lines it actually wraps to inside el (measured with inline word spans). */
function measureLines(el, text) {
  el.textContent = "";
  const spans = text.split(" ").map((w, i) => {
    if (i) el.append(document.createTextNode(" "));
    const s = span();
    s.textContent = w;
    el.append(s);
    return s;
  });
  const out = [];
  let top = null;
  for (const s of spans) {
    if (s.offsetTop !== top) { out.push([]); top = s.offsetTop; }
    out[out.length - 1].push(s.textContent);
  }
  return out.map((ws) => ws.join(" "));
}

/** Lines from data-lines: "a|b|c" sets them by hand, "auto" uses the natural wrap.
 *  data-stagger, data-base-delay and data-duration tune it. */
export function lines(el, {
  text = el.dataset.lines,
  stagger = Number(el.dataset.stagger) || 0,
  base = Number(el.dataset.baseDelay) || 0,
  duration = Number(el.dataset.duration) || 900,
} = {}) {
  const parts = text === "auto" ? measureLines(el, el.textContent.trim().replace(/\s+/g, " ")) : text.split("|");
  el.textContent = "";
  el.classList.add("rv");
  el.style.setProperty("--dur", `${duration}ms`);
  el.append(srOnly(parts.join(" ")));
  parts.forEach((part, i) => {
    const clip = span("clip");
    clip.setAttribute("aria-hidden", "true");
    const unit = span("unit");
    unit.textContent = part;
    unit.style.setProperty("--delay", `${base + i * stagger}ms`);
    clip.append(unit);
    el.append(clip);
  });
  return { play: () => el.classList.add("in") };
}

/** Words, keeping inline wrappers (e.g. the muted half of the About statement). */
export function words(el, { stagger = 35 } = {}) {
  const plain = el.textContent.trim().replace(/\s+/g, " ");
  let i = 0;
  const wrap = (node, into) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent.split(/(\s+)/).forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { into.append(document.createTextNode(" ")); return; }
          const w = span("word");
          w.textContent = piece;
          w.style.setProperty("--delay", `${i++ * stagger}ms`);
          into.append(w);
        });
      } else {
        const copy = child.cloneNode(false);
        wrap(child, copy);
        into.append(copy);
      }
    }
  };
  const visual = span();
  visual.setAttribute("aria-hidden", "true");
  wrap(el, visual);
  el.textContent = "";
  el.classList.add("rv");
  el.append(srOnly(plain), visual);
  return { play: () => el.classList.add("in") };
}

/** Run fn the first time el scrolls into view. */
export function onFirstView(el, fn) {
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    fn();
  }, { rootMargin: "0px 0px -8% 0px" });
  io.observe(el);
}

/** Every [data-lines] heading not driven by hand reveals on first view. */
export function autoLines() {
  // "auto" headings measure their wrap, so wait for the web font first
  document.fonts.ready.then(() => {
    $$("[data-lines]:not([data-manual])").forEach((el) => onFirstView(el, lines(el).play));
  });
}
