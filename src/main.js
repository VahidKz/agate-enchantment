import "./style.css";

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const year = document.querySelector("[data-year]");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const updateParallax = () => {
  if (reduceMotion) return;

  const viewportCenter = window.innerHeight / 2;

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const speed = Number(item.dataset.parallax) || 12;
    const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
    const y = Math.max(-speed, Math.min(speed, distance * -speed));
    item.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
  });
};

const updateFrame = () => {
  updateHeader();
  updateHeaderHeight();
  updateProgress();
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

const galleryModal = document.querySelector("[data-gallery-modal]");
const galleryImage = document.querySelector("[data-gallery-image]");
const galleryCaption = document.querySelector("[data-gallery-caption]");
const galleryThumbnails = document.querySelector("[data-gallery-thumbnails]");
const galleryItems = Array.from(document.querySelectorAll(".material-card a"))
  .map((link) => {
    const image = link.querySelector("img");
    const title = link.querySelector("h3")?.textContent?.trim() || image?.alt || "";

    return image
      ? {
          alt: image.alt,
          src: image.getAttribute("src"),
          title,
          trigger: link,
        }
      : null;
  })
  .filter(Boolean);

let activeGalleryIndex = 0;

const setGalleryImage = (index) => {
  if (!galleryImage || !galleryCaption || !galleryThumbnails || galleryItems.length === 0) return;

  activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activeGalleryIndex];
  galleryImage.src = item.src;
  galleryImage.alt = item.alt;
  galleryCaption.textContent = item.title;

  Array.from(galleryThumbnails.children).forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === activeGalleryIndex;
    thumb.classList.toggle("is-active", isActive);
    thumb.setAttribute("aria-current", isActive ? "true" : "false");
  });
};

const openGallery = (index) => {
  if (!galleryModal) return;

  setGalleryImage(index);
  galleryModal.classList.add("is-open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");
  galleryModal.querySelector("[data-gallery-close]")?.focus();
};

const closeGallery = () => {
  if (!galleryModal) return;

  galleryModal.classList.remove("is-open");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");
  galleryItems[activeGalleryIndex]?.trigger.focus();
};

if (galleryModal && galleryThumbnails && galleryItems.length > 0) {
  galleryItems.forEach((item, index) => {
    item.trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openGallery(index);
    });

    const thumb = document.createElement("button");
    const thumbImage = document.createElement("img");
    thumb.className = "gallery-thumb";
    thumb.type = "button";
    thumb.setAttribute("aria-label", `Show ${item.title}`);
    thumbImage.src = item.src;
    thumbImage.alt = "";
    thumb.append(thumbImage);
    thumb.addEventListener("click", () => setGalleryImage(index));
    galleryThumbnails.append(thumb);
  });

  document.querySelector("[data-gallery-prev]")?.addEventListener("click", () => {
    setGalleryImage(activeGalleryIndex - 1);
  });

  document.querySelector("[data-gallery-next]")?.addEventListener("click", () => {
    setGalleryImage(activeGalleryIndex + 1);
  });

  document.querySelectorAll("[data-gallery-close]").forEach((button) => {
    button.addEventListener("click", closeGallery);
  });

  document.addEventListener("keydown", (event) => {
    if (!galleryModal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeGallery();
    } else if (event.key === "ArrowLeft") {
      setGalleryImage(activeGalleryIndex - 1);
    } else if (event.key === "ArrowRight") {
      setGalleryImage(activeGalleryIndex + 1);
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
