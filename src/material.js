import "./material.css";
import headerMarkup  from "./sections/header.html?raw";
import footerMarkup  from "./sections/footer.html?raw";
import heroMarkup         from "./sections/material-hero.html?raw";
import viewMarkup         from "./sections/material-view.html?raw";
import applicationsMarkup from "./sections/material-applications.html?raw";
import specsMarkup        from "./sections/material-specs.html?raw";
import sourcingMarkup     from "./sections/material-sourcing.html?raw";
import processMarkup      from "./sections/material-process.html?raw";
import ctaMarkup          from "./sections/material-cta.html?raw";
import { initMobileNavigation } from "./navigation.js";

/* ─── Page assembly ──────────────────────────────────────────── */

const sections = [
  heroMarkup,
  viewMarkup,
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

initMobileNavigation();

/* ─── Cross-page nav link transformation ─────────────────────── */
// Anchor links that belong to the home page get a "/" prefix
// so clicking them navigates back to index rather than 404-ing.
// Links to #contact and #signature stay on this page.
const PAGE_ANCHORS = new Set(["#contact", "#signature", "#availability", "#material-view", "#applications", "#specification", "#sourcing", "#process"]);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || href === "#" || PAGE_ANCHORS.has(href)) return;
  link.setAttribute("href", `/${href}`);
});

// Brand mark links back to home
document.querySelectorAll('.brand[href="#hero"]').forEach((el) => {
  el.setAttribute("href", "/");
});

// Mark Ember Vein links as current page
document.querySelectorAll('.nav-links a[href="/material"], .footer-links a[href="/material"]').forEach((el) => {
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

/* Application feature selector */

const appFeatureImage = document.querySelector("[data-app-feature-image]");
const appFeatureLabel = document.querySelector("[data-app-feature-label]");
const appFeatureTitle = document.querySelector("[data-app-feature-title]");
const appFeatureCopy = document.querySelector("[data-app-feature-copy]");
const appFeatureDetails = [
  {
    label: document.querySelector("[data-app-detail-one-label]"),
    copy: document.querySelector("[data-app-detail-one-copy]"),
    labelKey: "appDetailOneLabel",
    copyKey: "appDetailOneCopy",
  },
  {
    label: document.querySelector("[data-app-detail-two-label]"),
    copy: document.querySelector("[data-app-detail-two-copy]"),
    labelKey: "appDetailTwoLabel",
    copyKey: "appDetailTwoCopy",
  },
  {
    label: document.querySelector("[data-app-detail-three-label]"),
    copy: document.querySelector("[data-app-detail-three-copy]"),
    labelKey: "appDetailThreeLabel",
    copyKey: "appDetailThreeCopy",
  },
];
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

  appFeatureDetails.forEach((detail) => {
    if (!detail.label || !detail.copy) return;
    detail.label.textContent = option.dataset[detail.labelKey] || "";
    detail.copy.textContent = option.dataset[detail.copyKey] || "";
  });

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

setActiveApplication(appOptions[0], false);

/* Material in View selector */

const materialView = document.querySelector("[data-material-view]");
const materialViewStage = document.querySelector("[data-material-view-stage]");
const materialViewImage = document.querySelector("[data-material-view-image]");
const materialViewType = document.querySelector("[data-material-view-type]");
const materialViewTitle = document.querySelector("[data-material-view-title]");
const materialViewCopy = document.querySelector("[data-material-view-copy]");
const materialViewList = document.querySelector("[data-material-view-list]");
const materialViewTabs = Array.from(document.querySelectorAll("[data-material-tab]"));
const materialViewPrev = document.querySelector("[data-material-prev]");
const materialViewNext = document.querySelector("[data-material-next]");
const materialViewZoomIn = document.querySelector("[data-material-zoom-in]");
const materialViewZoomOut = document.querySelector("[data-material-zoom-out]");
const materialViewReset = document.querySelector("[data-material-reset]");
const materialViewFullscreen = document.querySelector("[data-material-fullscreen]");
const materialSpecImage = document.querySelector("[data-spec-image]");
const materialSpecFocusControls = Array.from(document.querySelectorAll("[data-spec-focus]"));

const materialViewItems = {
  slabs: [
    {
      image: "/assets/slab-view.png",
      type: "Slab View",
      title: "Finished Ember Vein slab.",
      copy: "A broad slab view showing the material as a project-ready surface, useful for reading movement, tone, and scale.",
      alt: "Finished Ember Vein slab view for architectural review",
    },
    {
      image: "/assets/slab.png",
      type: "Slab View",
      title: "Polished surface selection.",
      copy: "A cleaner slab presentation for comparing color field, mineral rhythm, and the potential of a refined finished surface.",
      alt: "Polished Ember Vein slab surface",
    },
    {
      image: "/assets/STONE2.png",
      type: "Slab Placeholder",
      title: "Amber vein study.",
      copy: "Placeholder slab view for comparing warm movement, vein density, and architectural presence.",
      alt: "Placeholder slab image with amber and ivory movement",
    },
    {
      image: "/assets/STONE1.png",
      type: "Slab Placeholder",
      title: "Warm surface option.",
      copy: "Placeholder slab view for reviewing tone, movement, and surface character before final selection.",
      alt: "Placeholder warm stone slab surface",
    },
    {
      image: "/assets/STONE3.png",
      type: "Slab Placeholder",
      title: "Light movement option.",
      copy: "Placeholder slab view for comparing a lighter expression of natural mineral movement.",
      alt: "Placeholder light stone slab surface",
    },
    {
      image: "/assets/STONE4.png",
      type: "Slab Placeholder",
      title: "Green tonal reference.",
      copy: "Placeholder slab view for contrasting Ember Vein with a cooler architectural stone direction.",
      alt: "Placeholder Green Haze slab surface",
    },
    {
      image: "/assets/STONE5.png",
      type: "Slab Placeholder",
      title: "Soft translucent reference.",
      copy: "Placeholder slab view for softer color, translucency, and decorative surface comparison.",
      alt: "Placeholder soft translucent stone slab",
    },
    {
      image: "/assets/STONE6.png",
      type: "Slab Placeholder",
      title: "Dark architectural reference.",
      copy: "Placeholder slab view for contrasting depth, darkness, and dramatic architectural tone.",
      alt: "Placeholder dark architectural stone slab",
    },
  ],
  blocks: [
    {
      image: "/assets/block-view.png",
      type: "Block View",
      title: "Origin-selected block.",
      copy: "A raw block view showing mass, geometry, and the material potential before custom cutting or slab production.",
      alt: "Raw Ember Vein block selected for custom cutting",
    },
    {
      image: "/assets/block.png",
      type: "Block View",
      title: "Cutting potential.",
      copy: "A block study for understanding structure, volume, and how the stone may translate into larger architectural pieces.",
      alt: "Ember Vein block showing cutting potential",
    },
    {
      image: "/assets/BLOCK2.png",
      type: "Block Detail",
      title: "Raw material character.",
      copy: "An isolated block view for comparing surface density, color depth, and geological expression.",
      alt: "Ember Vein block material character",
    },
  ],
  details: [
    {
      image: "/assets/backlit.png",
      type: "Application Detail",
      title: "Backlit translucency.",
      copy: "A view of Ember Vein under light, showing the warmth and depth that make it powerful in feature walls and hospitality spaces.",
      alt: "Backlit Ember Vein feature wall",
    },
    {
      image: "/assets/stone_hero_2.png",
      type: "Material Detail",
      title: "Amber mineral movement.",
      copy: "A closer material expression for reading tone, depth, and the layered movement of the stone.",
      alt: "Ember Vein material detail with amber movement",
    },
    {
      image: "/assets/fireplace.png",
      type: "Interior Detail",
      title: "Architectural presence.",
      copy: "A project-oriented view that shows how the material can hold focus within a refined interior setting.",
      alt: "Ember Vein used in a refined architectural interior",
    },
  ],
};

let activeMaterialTab = "slabs";
let activeMaterialIndex = 0;
let materialZoom = 1;
let materialScrollZoom = 1;
let materialPanX = 0;
let materialPanY = 0;
let materialSlideOffsetX = 0;
let materialGestureStart = null;
const materialDoubleClickZoom = 1.85;

const clearMaterialSlideCue = () => {
  if (!materialViewStage) return;
  materialViewStage.classList.remove("is-slide-prev", "is-slide-next");
};

const setMaterialSlideCue = (direction) => {
  if (!materialViewStage) return;

  materialViewStage.classList.toggle("is-slide-prev", direction === "prev");
  materialViewStage.classList.toggle("is-slide-next", direction === "next");
};

const applyMaterialImageTransform = () => {
  if (!materialViewImage) return;
  const combinedZoom = materialZoom * materialScrollZoom;
  const translateX = materialPanX + materialSlideOffsetX;
  materialViewImage.style.transform = `translate3d(${translateX}px, ${materialPanY}px, 0) scale(${combinedZoom.toFixed(3)})`;
  materialViewStage?.classList.toggle("is-zoomed", materialZoom > 1);
};

const updateMaterialViewScrollZoom = () => {
  if (!materialView || !materialViewImage || reduceMotion) return;

  const rect = materialView.getBoundingClientRect();
  const scrollRange = window.innerHeight + rect.height;
  const progress = scrollRange > 0 ? clamp((window.innerHeight - rect.top) / scrollRange, 0, 1) : 0;
  const eased = 1 - Math.pow(1 - progress, 3);
  materialScrollZoom = 1.02 + eased * 0.06;
  applyMaterialImageTransform();
};

const resetMaterialImageTransform = () => {
  materialZoom = 1;
  materialPanX = 0;
  materialPanY = 0;
  materialSlideOffsetX = 0;
  applyMaterialImageTransform();
};

const toggleMaterialDoubleClickZoom = () => {
  materialGestureStart = null;
  materialSlideOffsetX = 0;
  clearMaterialSlideCue();
  materialViewStage?.classList.remove("is-dragging", "is-sliding");

  if (materialZoom > 1) {
    resetMaterialImageTransform();
    return;
  }

  materialZoom = materialDoubleClickZoom;
  materialPanX = 0;
  materialPanY = 0;
  applyMaterialImageTransform();
};

const setMaterialIndex = (index) => {
  const items = materialViewItems[activeMaterialTab] || [];
  if (items.length === 0) return;
  activeMaterialIndex = (index + items.length) % items.length;
  resetMaterialImageTransform();
  setActiveMaterialView();
  renderMaterialViewList();
};

const setActiveMaterialView = () => {
  if (!materialView || !materialViewImage || !materialViewType || !materialViewTitle || !materialViewCopy) return;

  const item = materialViewItems[activeMaterialTab]?.[activeMaterialIndex];
  if (!item) return;
  const items = materialViewItems[activeMaterialTab] || [];

  materialViewImage.src = item.image;
  materialViewImage.alt = item.alt;
  materialViewType.textContent = item.type;
  materialViewTitle.textContent = item.title;
  materialViewCopy.textContent = item.copy;

};

const renderMaterialViewList = () => {
  if (!materialViewList) return;

  const items = materialViewItems[activeMaterialTab] || [];
  materialViewList.innerHTML = "";

  items.forEach((item, index) => {
    const button = document.createElement("button");
    const isActive = index === activeMaterialIndex;
    button.className = `m-view-thumb${isActive ? " is-active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-pressed", String(isActive));
    button.innerHTML = `
      <span class="m-view-thumb-media">
        <img src="${item.image}" alt="" loading="lazy">
      </span>
      <span class="m-view-thumb-copy">
        <strong>${item.title}</strong>
        <span>${item.type}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      setMaterialIndex(index);
    });
    materialViewList.appendChild(button);
  });
};

materialViewTabs.forEach((tab) => {
  tab.setAttribute("aria-pressed", String(tab.dataset.materialTab === activeMaterialTab));
  tab.addEventListener("click", () => {
    activeMaterialTab = tab.dataset.materialTab || "slabs";
    activeMaterialIndex = 0;
    materialViewTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    setMaterialIndex(0);
  });
});

setActiveMaterialView();
renderMaterialViewList();

materialViewPrev?.addEventListener("click", () => setMaterialIndex(activeMaterialIndex - 1));
materialViewNext?.addEventListener("click", () => setMaterialIndex(activeMaterialIndex + 1));

materialViewZoomIn?.addEventListener("click", () => {
  materialZoom = clamp(materialZoom + 0.25, 1, 2.5);
  materialSlideOffsetX = 0;
  applyMaterialImageTransform();
});

materialViewZoomOut?.addEventListener("click", () => {
  materialZoom = clamp(materialZoom - 0.25, 1, 2.5);
  materialSlideOffsetX = 0;
  if (materialZoom === 1) {
    materialPanX = 0;
    materialPanY = 0;
  }
  applyMaterialImageTransform();
});

materialViewReset?.addEventListener("click", resetMaterialImageTransform);

materialViewStage?.addEventListener("dblclick", (event) => {
  if (event.target instanceof Element && event.target.closest(".m-view-controls, button, input")) return;
  event.preventDefault();
  toggleMaterialDoubleClickZoom();
});

materialViewFullscreen?.addEventListener("click", async () => {
  if (!materialViewStage || !document.fullscreenEnabled) return;
  if (document.fullscreenElement === materialViewStage) {
    await document.exitFullscreen();
    return;
  }
  await materialViewStage.requestFullscreen();
});

materialViewStage?.addEventListener("pointerdown", (event) => {
  if (event.target instanceof Element && event.target.closest("button, input")) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  clearMaterialSlideCue();
  const isZoomPanGesture = materialZoom > 1;
  materialGestureStart = {
    mode: isZoomPanGesture ? "pan" : "slide",
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    panX: materialPanX,
    panY: materialPanY,
    isHorizontalSlide: false,
  };
  materialViewStage.classList.toggle("is-dragging", isZoomPanGesture);
  materialViewStage.classList.toggle("is-sliding", !isZoomPanGesture);
  materialViewStage.setPointerCapture?.(event.pointerId);
});

materialViewStage?.addEventListener("pointermove", (event) => {
  if (!materialGestureStart || event.pointerId !== materialGestureStart.pointerId) return;

  const movedX = event.clientX - materialGestureStart.x;
  const movedY = event.clientY - materialGestureStart.y;

  if (materialGestureStart.mode === "pan") {
    materialPanX = materialGestureStart.panX + movedX;
    materialPanY = materialGestureStart.panY + movedY;
    applyMaterialImageTransform();
    return;
  }

  if (!materialGestureStart.isHorizontalSlide) {
    materialGestureStart.isHorizontalSlide = Math.abs(movedX) > 10 && Math.abs(movedX) > Math.abs(movedY) * 1.25;
  }

  if (!materialGestureStart.isHorizontalSlide) return;

  event.preventDefault();
  const stageWidth = materialViewStage?.getBoundingClientRect().width || 1;
  materialSlideOffsetX = clamp(movedX, -stageWidth * 0.28, stageWidth * 0.28);
  setMaterialSlideCue(movedX < 0 ? "next" : "prev");
  applyMaterialImageTransform();
});

const endMaterialDrag = (event) => {
  if (!materialGestureStart || event.pointerId !== materialGestureStart.pointerId) return;

  const gesture = materialGestureStart;
  const movedX = event.clientX - gesture.x;
  const movedY = event.clientY - gesture.y;
  const stageWidth = materialViewStage?.getBoundingClientRect().width || 0;
  const slideThreshold = clamp(stageWidth * 0.14, 56, 132);

  materialGestureStart = null;
  materialSlideOffsetX = 0;
  materialViewStage?.classList.remove("is-dragging");
  materialViewStage?.classList.remove("is-sliding");

  if (
    gesture.mode === "slide" &&
    Math.abs(movedX) >= slideThreshold &&
    Math.abs(movedX) > Math.abs(movedY) * 1.2
  ) {
    clearMaterialSlideCue();
    setMaterialIndex(activeMaterialIndex + (movedX < 0 ? 1 : -1));
    return;
  }

  clearMaterialSlideCue();
  applyMaterialImageTransform();
};

materialViewStage?.addEventListener("pointerup", endMaterialDrag);
materialViewStage?.addEventListener("pointercancel", endMaterialDrag);
materialViewStage?.addEventListener("lostpointercapture", () => {
  materialGestureStart = null;
  materialSlideOffsetX = 0;
  materialViewStage?.classList.remove("is-dragging");
  materialViewStage?.classList.remove("is-sliding");
  clearMaterialSlideCue();
  applyMaterialImageTransform();
});

const setMaterialSpecFocus = (control) => {
  if (!materialSpecImage) return;

  materialSpecImage.style.objectPosition = control.dataset.specFocus || "29% 50%";
  materialSpecImage.style.transform = `scale(${control.dataset.specScale || "1.1"})`;

  materialSpecFocusControls.forEach((item) => {
    const isActive = item === control;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });
};

materialSpecFocusControls.forEach((control) => {
  control.addEventListener("click", () => setMaterialSpecFocus(control));
});

if (materialSpecFocusControls.length > 0) {
  setMaterialSpecFocus(materialSpecFocusControls[0]);
}

let ticking = false;

const frame = () => {
  updateHeader();
  updateProgress();
  updateMaterialViewScrollZoom();
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
