import "./style.css";
import headerMarkup from "./sections/header.html?raw";
import heroMarkup from "./sections/hero.html?raw";
import storyMarkup from "./sections/story.html?raw";
import collectionMarkup from "./sections/collection.html?raw";
import formsMarkup from "./sections/material-forms.html?raw";
import finalCtaMarkup from "./sections/final-cta.html?raw";
import footerMarkup from "./sections/footer.html?raw";
import { initMobileNavigation } from "./navigation.js";

const mainSections = [
  heroMarkup,
  storyMarkup,
  collectionMarkup,
  formsMarkup,
  finalCtaMarkup,
];

const pageSections = [
  headerMarkup,
  `<main>${mainSections.join("\n")}</main>`,
  footerMarkup,
];

const page = document.querySelector("[data-page]");

if (page) {
  page.innerHTML = pageSections.join("\n");
}

document.querySelectorAll('.nav-links a[href="/"], .footer-links a[href="/"]').forEach((el) => {
  el.setAttribute("aria-current", "page");
});

initMobileNavigation();

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const year = document.querySelector("[data-year]");
const heroScene = document.querySelector("[data-hero-scene]");
const storySection = document.querySelector("#story");
const mineSlicesScene = document.querySelector("[data-mine-slices]");
const finalCtaMedia = document.querySelector("[data-final-cta-parallax]");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const sliceParallaxItems = Array.from(document.querySelectorAll("[data-slice-parallax]"));
const collectionParallaxItems = Array.from(document.querySelectorAll("[data-collection-parallax]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollCueOffset = 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOutQuint = (value) => 1 - Math.pow(1 - value, 5);

const sliceAssemblyOffsets = new Map([
  ["mine-slice--1", { x: -182, y: 120, rotate: -10.2 }],
  ["mine-slice--2", { x: 186, y: 720, rotate: 10.1 }],
  ["mine-slice--3", { x: 180, y: 198, rotate: 10 }],
]);

const formDrawer = document.querySelector("[data-form-drawer]");
const formDrawerTitle = document.querySelector("[data-form-drawer-title]");
const formDrawerCopy = document.querySelector("[data-form-drawer-copy]");
const formDrawerLink = document.querySelector("[data-form-drawer-link]");
let activeFormCard = null;

const formDrawerContent = {
  block: {
    title: "Request Ember Vein Block Details",
    copy: "Receive available block information, documentation, photos, videos, and inspection details based on current material.",
    subject: "Ember Vein Block Details Request",
  },
  slab: {
    title: "Request Ember Vein Slab Selection",
    copy: "Receive current slab options, photos, videos, finish details, and project suitability notes.",
    subject: "Ember Vein Slab Selection Request",
  },
};

const closeFormDrawer = () => {
  if (!formDrawer) return;

  formDrawer.classList.remove("is-open");
  formDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-form-drawer-open");
  activeFormCard?.focus();
  activeFormCard = null;

  window.setTimeout(() => {
    if (!formDrawer.classList.contains("is-open")) {
      formDrawer.classList.remove("is-from-left", "is-from-right");
    }
  }, 540);
};

const openFormDrawer = (type, trigger) => {
  if (!formDrawer || !formDrawerTitle || !formDrawerCopy || !formDrawerLink) return;

  const content = formDrawerContent[type];
  if (!content) return;

  activeFormCard = trigger;
  formDrawerTitle.textContent = content.title;
  formDrawerCopy.textContent = content.copy;
  formDrawerLink.href = `mailto:info@agatestone.it?subject=${encodeURIComponent(content.subject)}`;
  formDrawer.classList.remove("is-from-left", "is-from-right");
  formDrawer.classList.add(type === "block" ? "is-from-left" : "is-from-right");
  formDrawer.classList.add("is-open");
  formDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-form-drawer-open");
  formDrawer.querySelector("[data-form-drawer-close]")?.focus();
};

if (mineSlicesScene && !reduceMotion) {
  mineSlicesScene.classList.add("is-slice-init", "is-slice-before");
  window.setTimeout(() => mineSlicesScene.classList.remove("is-slice-init"), 1500);
}

if (year) {
  year.textContent = new Date().getFullYear();
}

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
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
};

let heroHasPointer = false;
let heroHasFocus = false;

const heroMotion = {
  currentX: 0,
  currentY: 0,
  frame: 0,
  targetX: 0,
  targetY: 0,
};

const setHeroMotionVars = (x, y) => {
  if (!heroScene) return;

  heroScene.style.setProperty("--hero-bg-x", `${(-x * 10).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-bg-y", `${(-y * 6).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-stone-x", `${(x * 18).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-stone-y", `${(y * 10).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-shadow-x", `${(x * 12).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-shadow-y", `${(y * 4).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-copy-x", `${(-x * 5).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-copy-y", `${(-y * 3).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-detail-x", `${(x * 8).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-detail-y", `${(y * 5).toFixed(2)}px`);
  heroScene.style.setProperty("--hero-light-x", `${(50 + x * 18).toFixed(2)}%`);
  heroScene.style.setProperty("--hero-light-y", `${(46 + y * 12).toFixed(2)}%`);
};

const animateHeroMotion = () => {
  heroMotion.currentX += (heroMotion.targetX - heroMotion.currentX) * 0.09;
  heroMotion.currentY += (heroMotion.targetY - heroMotion.currentY) * 0.09;

  const xDiff = Math.abs(heroMotion.targetX - heroMotion.currentX);
  const yDiff = Math.abs(heroMotion.targetY - heroMotion.currentY);

  if (xDiff < 0.001 && yDiff < 0.001) {
    heroMotion.currentX = heroMotion.targetX;
    heroMotion.currentY = heroMotion.targetY;
  }

  setHeroMotionVars(heroMotion.currentX, heroMotion.currentY);

  if (xDiff >= 0.001 || yDiff >= 0.001) {
    heroMotion.frame = window.requestAnimationFrame(animateHeroMotion);
  } else {
    heroMotion.frame = 0;
  }
};

const requestHeroMotion = () => {
  if (heroMotion.frame) return;
  heroMotion.frame = window.requestAnimationFrame(animateHeroMotion);
};

const updateHeroDetail = () => {
  if (!heroScene) return;

  const rect = heroScene.getBoundingClientRect();
  const isHeroPresent = rect.top < window.innerHeight * 0.62 && rect.bottom > window.innerHeight * 0.34;
  const hasScrollIntent = window.scrollY > 18 && isHeroPresent;
  heroScene.classList.toggle("is-detail-visible", heroHasPointer || heroHasFocus || hasScrollIntent);
};

const getStoryScrollOffset = () => {
  if (!storySection) return 0;

  const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  const rect = storySection.getBoundingClientRect();

  return headerHeight - rect.top;
};

const updateSliceAssemblyState = (progress) => {
  if (!mineSlicesScene) return;

  const isBefore = progress < 0.05;
  const isSettled = progress > 0.985;
  mineSlicesScene.style.setProperty("--slice-assembly-progress", progress.toFixed(3));
  mineSlicesScene.classList.toggle("is-slice-before", isBefore);
  mineSlicesScene.classList.toggle("is-slice-assembling", !isBefore && !isSettled);
  mineSlicesScene.classList.toggle("is-slice-settled", isSettled);
};

const updateParallax = () => {
  const storyScrollOffset = getStoryScrollOffset();
  const storyRect = storySection?.getBoundingClientRect();
  const rawSliceAssemblyProgress = storyRect
    ? clamp(1 - storyRect.top / (window.innerHeight * 0.78), 0, 1)
    : 1;
  const sliceAssemblyProgress = easeOutQuint(rawSliceAssemblyProgress);
  updateSliceAssemblyState(rawSliceAssemblyProgress);

  if (reduceMotion) return;

  const viewportCenter = window.innerHeight / 2;

  parallaxItems.forEach((item) => {
    const shouldBoundToParent = item.dataset.parallaxBounds === "parent" && item.parentElement;
    const rect = shouldBoundToParent
      ? item.parentElement.getBoundingClientRect()
      : item.getBoundingClientRect();
    const speed = Number(item.dataset.parallax) || 12;
    const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
    let y = clamp(distance * -speed, -speed, speed);

    if (shouldBoundToParent) {
      const parentRect = rect;
      const naturalRatio = item.naturalWidth > 0 ? item.naturalHeight / item.naturalWidth : 1;
      const renderedHeight = Math.max(parentRect.height, parentRect.width * naturalRatio);
      const maxShift = Math.max(0, (renderedHeight - parentRect.height) / 2);
      y = clamp(y, -maxShift, maxShift);
    }

    item.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
  });

  const isCompactViewport = window.matchMedia("(max-width: 820px)").matches;

  sliceParallaxItems.forEach((item) => {
    if (isCompactViewport) {
      item.style.setProperty("--slice-parallax-y", "0px");
      item.style.setProperty("--slice-assemble-x", "0px");
      item.style.setProperty("--slice-assemble-y", "0px");
      item.style.setProperty("--slice-assemble-rotate", "0deg");
      return;
    }

    const configuredDirection = Number(item.dataset.sliceParallax);
    const direction = Number.isFinite(configuredDirection) ? configuredDirection : 0;
    const assemblyOffset = Array.from(sliceAssemblyOffsets).find(([className]) => item.classList.contains(className))?.[1];
    const remainingAssembly = 1 - sliceAssemblyProgress;

    const y = storyScrollOffset * direction;
    item.style.setProperty("--slice-parallax-y", `${y.toFixed(2)}px`);

    if (assemblyOffset) {
      item.style.setProperty("--slice-assemble-x", `${(assemblyOffset.x * remainingAssembly).toFixed(2)}px`);
      item.style.setProperty("--slice-assemble-y", `${(assemblyOffset.y * remainingAssembly).toFixed(2)}px`);
      item.style.setProperty("--slice-assemble-rotate", `${(assemblyOffset.rotate * remainingAssembly).toFixed(3)}deg`);
    }
  });

  collectionParallaxItems.forEach((item) => {
    item.style.setProperty("--parallax-y", "0px");
    item.style.setProperty("--panel-scroll-y", "0px");
    item.style.setProperty("--material-image-parallax-y", "0px");
  });

  if (finalCtaMedia) {
    const rect = finalCtaMedia.parentElement?.getBoundingClientRect() || finalCtaMedia.getBoundingClientRect();
    const speed = Number(finalCtaMedia.dataset.finalCtaParallax) || 0;
    const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
    const y = clamp(distance * -speed, -Math.abs(speed), Math.abs(speed));
    finalCtaMedia.style.setProperty("--final-cta-media-y", `${y.toFixed(2)}px`);
  }
};

const updateFrame = () => {
  updateHeader();
  updateHeaderHeight();
  updateProgress();
  updateHeroDetail();
  updateParallax();
};

let ticking = false;

const requestFrame = () => {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(() => {
    updateFrame();
    ticking = false;
  });
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
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

updateFrame();
window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);

if (header && "ResizeObserver" in window) {
  const headerObserver = new ResizeObserver(requestFrame);
  headerObserver.observe(header);
}

if (mineSlicesScene) {
  const interactiveSlices = Array.from(mineSlicesScene.querySelectorAll(".mine-slice"));
  let activeSlicePointer = null;

  const selectMineSlice = (slice) => {
    interactiveSlices.forEach((item) => {
      const isSelected = item === slice;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    mineSlicesScene.classList.add("has-slice-selection");
    slice.classList.add("is-click-rippling");
    window.setTimeout(() => slice.classList.remove("is-click-rippling"), 720);
  };

  const clearSlicePress = () => {
    interactiveSlices.forEach((item) => item.classList.remove("is-pressing"));
    activeSlicePointer = null;
  };

  interactiveSlices.forEach((slice) => {
    slice.setAttribute("aria-pressed", "false");

    const updateSlicePressPoint = (event) => {
      const rect = slice.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
      slice.style.setProperty("--slice-press-x", `${x.toFixed(2)}%`);
      slice.style.setProperty("--slice-press-y", `${y.toFixed(2)}%`);
    };

    slice.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      activeSlicePointer = event.pointerId;
      slice.classList.add("is-pressing");
      updateSlicePressPoint(event);
      slice.setPointerCapture?.(event.pointerId);
    });

    slice.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activeSlicePointer) return;
      updateSlicePressPoint(event);
    });

    slice.addEventListener("pointerup", (event) => {
      if (event.pointerId !== activeSlicePointer) return;
      updateSlicePressPoint(event);
      clearSlicePress();
      selectMineSlice(slice);
    });

    slice.addEventListener("pointercancel", clearSlicePress);
    slice.addEventListener("lostpointercapture", clearSlicePress);

    slice.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      slice.style.setProperty("--slice-press-x", "50%");
      slice.style.setProperty("--slice-press-y", "50%");
      selectMineSlice(slice);
    });
  });
}

if (heroScene) {
  const heroMedia = heroScene.querySelector(".hero-media");
  const heroCursorLight = document.createElement("span");
  let heroLightImpactTimer = 0;

  if (heroMedia) {
    heroCursorLight.className = "hero-cursor-light";
    heroCursorLight.setAttribute("aria-hidden", "true");
    heroMedia.appendChild(heroCursorLight);
  }

  const updateHeroRevealPoint = (event) => {
    if (!heroMedia) return false;

    const pointerEvent = event.getCoalescedEvents?.().at(-1) || event;
    const rect = heroMedia.getBoundingClientRect();
    const pointX = clamp(pointerEvent.clientX - rect.left, 0, rect.width);
    const pointY = clamp(pointerEvent.clientY - rect.top, 0, rect.height);
    const x = rect.width > 0 ? (pointX / rect.width) * 100 : 50;
    const y = rect.height > 0 ? (pointY / rect.height) * 100 : 50;

    heroScene.style.setProperty("--hero-reveal-x", `${x.toFixed(2)}%`);
    heroScene.style.setProperty("--hero-reveal-y", `${y.toFixed(2)}%`);
    heroScene.style.setProperty("--hero-reveal-x-px", `${pointX.toFixed(1)}px`);
    heroScene.style.setProperty("--hero-reveal-y-px", `${pointY.toFixed(1)}px`);
    heroCursorLight.style.transform = `translate3d(${pointX.toFixed(1)}px, ${pointY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    return (
      pointerEvent.clientX >= rect.left &&
      pointerEvent.clientX <= rect.right &&
      pointerEvent.clientY >= rect.top &&
      pointerEvent.clientY <= rect.bottom
    );
  };

  heroMedia?.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    heroHasPointer = true;
    heroMedia.classList.add("is-lighting");
    updateHeroRevealPoint(event);
    updateHeroDetail();
  });

  heroMedia?.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    updateHeroRevealPoint(event);
  });

  heroMedia?.addEventListener("pointerleave", () => {
    heroHasPointer = false;
    if (
      !heroMedia.classList.contains("is-hero-dragging") &&
      !heroMedia.classList.contains("is-light-impact")
    ) {
      heroMedia.classList.remove("is-lighting");
    }
    updateHeroDetail();
  });

  const triggerHeroLightImpact = () => {
    if (!heroMedia) return;

    heroMedia.classList.add("is-lighting");
    heroMedia.classList.remove("is-light-impact");
    window.clearTimeout(heroLightImpactTimer);
    void heroMedia.offsetWidth;
    heroMedia.classList.add("is-light-impact");

    heroLightImpactTimer = window.setTimeout(() => {
      heroMedia.classList.remove("is-light-impact");

      if (!heroHasPointer && !heroHasFocus) {
        heroMedia.classList.remove("is-lighting");
      }
    }, 850);
  };

  heroScene.addEventListener("focusin", () => {
    heroHasFocus = true;
    updateHeroDetail();
  });

  heroScene.addEventListener("focusout", () => {
    heroHasFocus = false;
    updateHeroDetail();
  });

  // Hero stone press: Web Animations API (never re-triggers CSS entry anim).
  if (heroMedia) {
    let isHeroPressing = false;
    let didHeroDrag = false;
    let activeHeroPointer = null;
    let heroPressStartX = 0;
    let heroPressStartY = 0;
    let suppressHeroClickUntil = 0;

    const endHeroDrag = (event) => {
      if (!isHeroPressing || (activeHeroPointer !== null && event.pointerId !== activeHeroPointer)) return;

      isHeroPressing = false;
      activeHeroPointer = null;
      heroMedia?.classList.remove("is-hero-dragging");
      const wasHeroDrag = didHeroDrag;

      if (!heroHasPointer && !heroHasFocus) {
        heroMedia?.classList.remove("is-lighting");
      }

      if (wasHeroDrag) {
        suppressHeroClickUntil = performance.now() + 280;
      }
    };

    heroMedia?.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      isHeroPressing = true;
      didHeroDrag = false;
      activeHeroPointer = event.pointerId;
      heroPressStartX = event.clientX;
      heroPressStartY = event.clientY;
      updateHeroRevealPoint(event);
      heroMedia.classList.add("is-lighting");
      heroMedia.classList.add("is-hero-dragging");
      heroMedia.classList.remove("is-light-impact");
      window.clearTimeout(heroLightImpactTimer);
      heroMedia.setPointerCapture?.(event.pointerId);
    });

    heroMedia?.addEventListener("pointermove", (event) => {
      if (!isHeroPressing || event.pointerId !== activeHeroPointer) return;

      updateHeroRevealPoint(event);
      const movedX = event.clientX - heroPressStartX;
      const movedY = event.clientY - heroPressStartY;
      const isPastDragThreshold = Math.hypot(movedX, movedY) > 8;
      didHeroDrag ||= isPastDragThreshold;
      if (isPastDragThreshold) {
        heroMedia.classList.add("is-hero-dragging");
      }
    });

    heroMedia?.addEventListener("pointerrawupdate", (event) => {
      if (!isHeroPressing || event.pointerId !== activeHeroPointer) return;
      updateHeroRevealPoint(event);
    });

    heroMedia?.addEventListener("pointerup", endHeroDrag);
    heroMedia?.addEventListener("pointercancel", endHeroDrag);
    heroMedia?.addEventListener("lostpointercapture", endHeroDrag);

    heroMedia?.addEventListener("click", (event) => {
      if (performance.now() < suppressHeroClickUntil) {
        event.preventDefault();
      }

      // Prevent the follow-up click after drag without adding extra visual motion.
    });
  }
}

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

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.matches("[data-form-card]")) return;

  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();

    const behavior = reduceMotion ? "auto" : "smooth";
    const scrollExtra = Number(link.dataset.scrollExtra) || 0;

    if (link.classList.contains("scroll-cue")) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY + scrollCueOffset;

      window.scrollTo({
        behavior,
        top: Math.min(maxScroll, Math.max(0, targetTop)),
      });
      return;
    }

    if (scrollExtra !== 0) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY + scrollExtra;

      window.scrollTo({
        behavior,
        top: Math.min(maxScroll, Math.max(0, targetTop)),
      });
      return;
    }

    target.scrollIntoView({ behavior, block: "start" });
  });
});
