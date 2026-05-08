import "./style.css";

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const year = document.querySelector("[data-year]");
const heroScene = document.querySelector("[data-hero-scene]");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const sliceParallaxItems = Array.from(document.querySelectorAll("[data-slice-parallax]"));
const collectionParallaxItems = Array.from(document.querySelectorAll("[data-collection-parallax]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

const updateParallax = () => {
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
      return;
    }

    const motionRoot = item.closest(".statement") || item.closest(".mine-showcase") || item.parentElement || item;
    const rect = motionRoot.getBoundingClientRect();
    const speed = Number(item.dataset.sliceParallax) || 12;
    const maxShift = Math.abs(speed);
    const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
    const targetY = clamp(distance * speed, -maxShift, maxShift);
    const currentY = Number(item.dataset.sliceCurrentY) || 0;
    const y = currentY + (targetY - currentY) * 0.12;
    item.dataset.sliceCurrentY = y.toFixed(3);
    item.style.setProperty("--slice-parallax-y", `${y.toFixed(2)}px`);
  });

  collectionParallaxItems.forEach((item) => {
    const isCompactViewport = window.matchMedia("(max-width: 820px)").matches;

    if (isCompactViewport) {
      item.style.setProperty("--panel-scroll-y", "0px");
      return;
    }

    const motionRoot = item.closest(".collection") || item;
    const rect = motionRoot.getBoundingClientRect();
    const speed = Number(item.dataset.collectionParallax) || 12;
    const maxShift = Math.abs(speed);
    const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
    const y = clamp(distance * speed, -maxShift, maxShift);
    item.style.setProperty("--panel-scroll-y", `${y.toFixed(2)}px`);
  });
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

if (heroScene) {
  heroScene.addEventListener("focusin", () => {
    heroHasFocus = true;
    updateHeroDetail();
  });

  heroScene.addEventListener("focusout", () => {
    heroHasFocus = false;
    updateHeroDetail();
  });

  // Hero stone touch: Web Animations API (never re-triggers CSS entry anim).
  if (!reduceMotion) {
    const heroMedia = heroScene.querySelector(".hero-media");
    let isHeroPressing = false;
    let didHeroDrag = false;
    let activeHeroPointer = null;
    let heroPressLight = null;
    let heroPressStartX = 0;
    let heroPressStartY = 0;
    let suppressHeroClickUntil = 0;

    const removeHeroPressLight = (linger = 0) => {
      if (!heroPressLight) return;

      const light = heroPressLight;
      heroPressLight = null;
      window.setTimeout(() => light.classList.remove("is-visible"), linger);
      window.setTimeout(() => light.remove(), linger + 980);
    };

    const updateHeroPressLight = (event) => {
      if (!heroMedia || !heroPressLight) return false;

      const rect = heroMedia.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;

      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return false;

      heroPressLight.style.setProperty("--press-x", `${((cx / rect.width) * 100).toFixed(2)}%`);
      heroPressLight.style.setProperty("--press-y", `${((cy / rect.height) * 100).toFixed(2)}%`);
      return true;
    };

    const endHeroDrag = (event) => {
      if (!isHeroPressing || (activeHeroPointer !== null && event.pointerId !== activeHeroPointer)) return;

      isHeroPressing = false;
      activeHeroPointer = null;
      heroMedia?.classList.remove("is-hero-dragging");
      const wasHeroDrag = didHeroDrag;

      if (!wasHeroDrag) {
        heroPressLight?.classList.add("is-click-wave");
      }

      removeHeroPressLight(wasHeroDrag ? 120 : 620);

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
      heroPressLight?.remove();
      heroPressLight = document.createElement("span");
      heroPressLight.className = "hero-drag-sheen";
      heroMedia.appendChild(heroPressLight);
      heroMedia.classList.add("is-hero-dragging");
      heroMedia.setPointerCapture?.(event.pointerId);

      if (updateHeroPressLight(event)) {
        window.requestAnimationFrame(() => heroPressLight?.classList.add("is-visible"));
      }
    });

    heroMedia?.addEventListener("pointermove", (event) => {
      if (!isHeroPressing || event.pointerId !== activeHeroPointer) return;

      const movedX = event.clientX - heroPressStartX;
      const movedY = event.clientY - heroPressStartY;
      didHeroDrag ||= Math.hypot(movedX, movedY) > 8;
      updateHeroPressLight(event);
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

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();

    const behavior = reduceMotion ? "auto" : "smooth";
    const scrollExtra = Number(link.dataset.scrollExtra) || 0;
    const shouldFitStoryViewport = link.classList.contains("scroll-cue");

    if (shouldFitStoryViewport) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - 36;

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
