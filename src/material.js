import "./material.css";
import headerMarkup  from "./sections/header.html?raw";
import footerMarkup  from "./sections/footer.html?raw";
import heroMarkup         from "./sections/material-hero.html?raw";
import formsMarkup        from "./sections/material-forms.html?raw";
import applicationsMarkup from "./sections/material-applications.html?raw";
import specsMarkup        from "./sections/material-specs.html?raw";
import sourcingMarkup     from "./sections/material-sourcing.html?raw";
import processMarkup      from "./sections/material-process.html?raw";
import ctaMarkup          from "./sections/material-cta.html?raw";

/* ─── Page assembly ──────────────────────────────────────────── */

const sections = [
  heroMarkup,
  formsMarkup,
  applicationsMarkup,
  specsMarkup,
  sourcingMarkup,
  processMarkup,
  ctaMarkup,
];

const page = document.querySelector("[data-page]");
if (page) {
  page.innerHTML = [
    headerMarkup,
    `<main>${sections.join("\n")}</main>`,
    footerMarkup,
  ].join("\n");
}

/* ─── Cross-page nav link transformation ─────────────────────── */
// Anchor links that belong to the home page get a "/" prefix
// so clicking them navigates back to index rather than 404-ing.
// Links to #contact and #signature stay on this page.
const PAGE_ANCHORS = new Set(["#contact", "#signature", "#availability", "#forms", "#applications", "#specification", "#sourcing", "#process"]);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || href === "#" || PAGE_ANCHORS.has(href)) return;
  link.setAttribute("href", `/${href}`);
});

// Brand mark links back to home
document.querySelectorAll('.brand[href="#hero"]').forEach((el) => {
  el.setAttribute("href", "/");
});

// Mark Red Onyx nav link as current page
document.querySelectorAll('.nav-links a[href="/material"]').forEach((el) => {
  el.setAttribute("aria-current", "page");
});

/* ─── Shared utilities ───────────────────────────────────────── */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Scroll progress ────────────────────────────────────────── */

const header   = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");

const updateProgress = () => {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${clamp(pct, 0, 1)})`;
};

/* ─── Sticky header ──────────────────────────────────────────── */

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

/* ─── Reveal on scroll ───────────────────────────────────────── */

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

if (revealItems.length > 0 && !reduceMotion) {
  document.documentElement.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ─── Smooth scroll for on-page anchors ─────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.matches("[data-form-card]")) return;

  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

/* ─── Scroll-cue smooth offset ──────────────────────────────── */

document.querySelectorAll(".scroll-cue").forEach((cue) => {
  cue.addEventListener("click", (e) => {
    const id = cue.getAttribute("href");
    const target = id && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      behavior: reduceMotion ? "auto" : "smooth",
      top: target.getBoundingClientRect().top + window.scrollY,
    });
  });
});

/* ─── RAF loop ───────────────────────────────────────────────── */

/* Private material request drawer */

const formDrawer = document.querySelector("[data-form-drawer]");
const formDrawerTitle = document.querySelector("[data-form-drawer-title]");
const formDrawerCopy = document.querySelector("[data-form-drawer-copy]");
const formDrawerLink = document.querySelector("[data-form-drawer-link]");
let activeFormCard = null;

const formDrawerContent = {
  block: {
    title: "Request Red Onyx Block Details",
    copy: "Receive available block information, documentation, photos, videos, and inspection details based on current material.",
    subject: "Red Onyx Block Details Request",
  },
  slab: {
    title: "Request Red Onyx Slab Selection",
    copy: "Receive current slab options, photos, videos, finish details, and project suitability notes.",
    subject: "Red Onyx Slab Selection Request",
  },
};

const closeFormDrawer = () => {
  if (!formDrawer) return;

  formDrawer.classList.remove("is-open");
  formDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-form-drawer-open");
  activeFormCard?.focus();
  activeFormCard = null;
};

const openFormDrawer = (type, trigger) => {
  if (!formDrawer || !formDrawerTitle || !formDrawerCopy || !formDrawerLink) return;

  const content = formDrawerContent[type];
  if (!content) return;

  activeFormCard = trigger;
  formDrawerTitle.textContent = content.title;
  formDrawerCopy.textContent = content.copy;
  formDrawerLink.href = `mailto:info@agatestone.it?subject=${encodeURIComponent(content.subject)}`;
  formDrawer.classList.add("is-open");
  formDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-form-drawer-open");
  formDrawer.querySelector("[data-form-drawer-close]")?.focus();
};

document.querySelectorAll("[data-form-card]").forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    openFormDrawer(card.dataset.formCard, card);
  });
});

document.querySelectorAll("[data-form-drawer-close]").forEach((control) => {
  control.addEventListener("click", closeFormDrawer);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && formDrawer?.classList.contains("is-open")) {
    closeFormDrawer();
  }
});

/* Application feature selector */

const appFeatureImage = document.querySelector("[data-app-feature-image]");
const appFeatureLabel = document.querySelector("[data-app-feature-label]");
const appFeatureTitle = document.querySelector("[data-app-feature-title]");
const appFeatureCopy = document.querySelector("[data-app-feature-copy]");
const appOptions = Array.from(document.querySelectorAll("[data-app-option]"));

const scrollToApplicationFeatureOnMobile = () => {
  if (!window.matchMedia("(max-width: 680px)").matches) return;

  appFeatureImage?.closest(".m-app-feature")?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
};

const setActiveApplication = (option, shouldScroll = false) => {
  if (!option || !appFeatureImage || !appFeatureLabel || !appFeatureTitle || !appFeatureCopy) return;

  appFeatureImage.src = option.dataset.appImage;
  appFeatureImage.alt = option.dataset.appAlt;
  appFeatureLabel.textContent = option.dataset.appLabel;
  appFeatureTitle.textContent = option.dataset.appTitle;
  appFeatureCopy.textContent = option.dataset.appCopy;

  appOptions.forEach((item) => {
    const isActive = item === option;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  if (shouldScroll) {
    window.setTimeout(scrollToApplicationFeatureOnMobile, 60);
  }
};

appOptions.forEach((option) => {
  option.setAttribute("aria-pressed", "false");
  option.addEventListener("click", () => setActiveApplication(option, true));
});

let ticking = false;

const frame = () => {
  updateHeader();
  updateProgress();
  ticking = false;
};

const request = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(frame);
};

frame();
window.addEventListener("scroll", request, { passive: true });
window.addEventListener("resize", request);
