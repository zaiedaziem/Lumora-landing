// Entry — modules run in page order. The loader runs first: it locks scroll and, when it has
// slid away, resolves `ready`, which the header and hero entrances wait on.
import { autoReveal } from "./engine.js";
import { autoLines } from "./text.js";
import { initPills, initLinks, initMicroHovers } from "./components.js";
import { initLoader } from "./loader.js";
import { initHeader } from "./header.js";
import { initHero } from "./hero.js";
import { initSections } from "./sections.js";
import { initOverlays } from "./overlays.js";

initPills();
initLinks();
initLoader();
initHeader();
initHero();
initSections();
initMicroHovers();
initOverlays();
autoLines();
autoReveal();
