export const initMobileNavigation = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-mobile-menu-toggle]");
  const nav = document.querySelector("#primary-navigation");

  if (!header || !toggle || !nav) return;

  const setOpen = (isOpen) => {
    header.classList.toggle("is-menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };

  toggle.addEventListener("click", () => {
    setOpen(!header.classList.contains("is-menu-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 961px)").matches) {
      setOpen(false);
    }
  });
};
