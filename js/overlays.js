// Overlays and routing: the full-screen menu, the request modal (stubbed submit), and the
// click routing shared by the header, menu, hero and footer.
import { $, $$, Spring, styler, stopScroll, startScroll, scrollToId } from "./engine.js";
import { setPillLabel } from "./components.js";

/* ---------- Menu overlay ---------- */
const menu = $("#navmenu");
let menuOpen = false;
let menuReturn = null;
const menuFade = new Spring({ opacity: 0 }, { tension: 280, friction: 32 }, (v) => { menu.style.opacity = v.opacity; });

export function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  menuReturn = document.activeElement;
  menu.hidden = false;
  stopScroll();
  $$(".navmenu__item", menu).forEach((b, i) => { b.style.transitionDelay = `${i * 45 + 80}ms`; });
  requestAnimationFrame(() => menu.classList.add("open"));
  menuFade.to({ opacity: 1 });
  $("#menu-close").focus();
}

export function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  menu.classList.remove("open");
  $$(".navmenu__item", menu).forEach((b) => { b.style.transitionDelay = "0ms"; });
  menuFade.to({ opacity: 0 }, {
    onRest: () => {
      if (menuOpen) return;
      menu.hidden = true;
      startScroll();
      menuReturn?.focus?.();
    },
  });
}

/* ---------- Request modal ---------- */
const modal = $("#modal");
const panel = $("#modal-panel");
const form = $("#modal-form");
const formView = $("#modal-form-view");
const success = $("#modal-success");
const submit = $("#modal-submit");
let modalOpen = false;
let modalReturn = null;
const panelSpring = new Spring({ opacity: 0, y: 28 }, { tension: 260, friction: 30 }, styler(panel));

export function openRequest() {
  if (modalOpen) return;
  modalOpen = true;
  modalReturn = document.activeElement;
  modal.hidden = false;
  stopScroll();
  panelSpring.set({ opacity: 0, y: 28 });
  requestAnimationFrame(() => modal.classList.add("open"));
  panelSpring.to({ opacity: 1, y: 0 });
  setTimeout(() => (success.hidden ? form.elements.name : $("#modal-done")).focus(), 60);
}

export function closeRequest() {
  if (!modalOpen) return;
  modalOpen = false;
  modal.classList.remove("open");
  panelSpring.to({ opacity: 0, y: 18 }, {
    onRest: () => {
      if (modalOpen) return;
      modal.hidden = true;
      startScroll();
      modalReturn?.focus?.();
    },
  });
  // Reset the form a beat after it has closed
  setTimeout(() => {
    if (modalOpen) return;
    form.reset();
    setPillLabel(submit, "Send request");
    submit.disabled = false;
    formView.hidden = false;
    success.hidden = true;
  }, 300);
}

function initModal() {
  modal.addEventListener("click", closeRequest);                 // backdrop
  panel.addEventListener("click", (e) => e.stopPropagation());
  $("#modal-close").addEventListener("click", closeRequest);
  $("#modal-done").addEventListener("click", closeRequest);

  // Stub: no network call — show "Sending…", then the success state
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submit.disabled = true;
    setPillLabel(submit, "Sending…");
    setTimeout(() => {
      formView.hidden = true;
      success.hidden = false;
      $("#modal-done").focus();
    }, 700);
  });
}

/* ---------- Routing ---------- */
function route(id) {
  if (id === "contact") openRequest();
  else scrollToId(id);
}

function initRouting() {
  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      if (menu.contains(nav)) {
        closeMenu();
        setTimeout(() => route(nav.dataset.nav), 120);
      } else {
        route(nav.dataset.nav);
      }
      return;
    }
    const scroll = e.target.closest("[data-scroll]");
    if (scroll) {
      e.preventDefault();
      scrollToId(scroll.dataset.scroll);
      return;
    }
    if (e.target.closest("[data-open-request]")) openRequest();
  });

  $("#menu-open").addEventListener("click", openMenu);
  $("#menu-close").addEventListener("click", closeMenu);

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalOpen) closeRequest();
    else if (menuOpen) closeMenu();
  });
}

export function initOverlays() {
  initModal();
  initRouting();
}
