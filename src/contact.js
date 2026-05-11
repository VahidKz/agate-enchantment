import "./style.css";
import "./contact.css";
import headerMarkup from "./sections/header.html?raw";
import contactHeroMarkup from "./sections/contact-hero.html?raw";
import contactNoteMarkup from "./sections/contact-note.html?raw";
import contactFormMarkup from "./sections/contact-form.html?raw";
import contactLocationsMarkup from "./sections/contact-locations.html?raw";
import contactExtraMarkup from "./sections/contact-extra.html?raw";
import contactCtaMarkup from "./sections/contact-cta.html?raw";
import footerMarkup from "./sections/footer.html?raw";
import { initMobileNavigation } from "./navigation.js";

const sections = [
  contactHeroMarkup,
  contactNoteMarkup,
  contactFormMarkup,
  contactLocationsMarkup,
  contactExtraMarkup,
  contactCtaMarkup,
];

const page = document.querySelector("[data-page]");

if (page) {
  page.innerHTML = [
    headerMarkup,
    `<main class="contact-page">${sections.join("\n")}</main>`,
    footerMarkup,
  ].join("\n");
}

document.querySelectorAll('.nav-links a[href="/contact"], .footer-links a[href="/contact"]').forEach((link) => {
  link.setAttribute("aria-current", "page");
});

initMobileNavigation();

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateHeaderHeight = () => {
  if (!header) return;
  root.style.setProperty("--header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
};

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

const updateProgress = () => {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${clamp(amount, 0, 1)})`;
};

if (revealItems.length > 0 && !reduceMotion) {
  root.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const getValue = (name) => String(data.get(name) || "").trim();
    const subjectParts = ["Agate Enchantment Inquiry"];
    const interest = getValue("interest");
    const projectType = getValue("project_type");

    if (interest) subjectParts.push(interest);
    if (projectType) subjectParts.push(projectType);

    const rows = [
      ["Full Name", getValue("name")],
      ["Email", getValue("email")],
      ["Company / Studio", getValue("company")],
      ["Project Type", projectType],
      ["Primary Interest", interest],
      ["Project Location", getValue("location")],
      ["Project Message", getValue("message")],
    ];

    const body = rows
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}:\n${value}`)
      .join("\n\n");

    const mailto = new URL("mailto:info@agatestone.it");
    mailto.searchParams.set("subject", subjectParts.join(" - "));
    mailto.searchParams.set("body", body || "Hello Agate Enchantment, I would like to begin a project inquiry.");

    window.location.href = mailto.toString();
  });
});

let ticking = false;

const frame = () => {
  updateHeader();
  updateHeaderHeight();
  updateProgress();
  ticking = false;
};

const requestFrame = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(frame);
};

frame();
window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);

if (header && "ResizeObserver" in window) {
  new ResizeObserver(requestFrame).observe(header);
}
