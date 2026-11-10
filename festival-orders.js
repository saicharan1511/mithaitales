"use strict";

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canAnimate = typeof Element.prototype.animate === "function";

  /* -------------------------------------------------------
     Occasion tabs (accessible tablist, arrow-key support)
     ------------------------------------------------------- */
  const tabs = [...document.querySelectorAll(".fo-tab")];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  function selectTab(index, moveFocus = false) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });

    if (!reduceMotion.matches && canAnimate) {
      panels[index].animate(
        [
          { opacity: 0, transform: "translateY(16px) scale(0.985)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }
        ],
        { duration: 500, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
      );
    }

    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(i));

    tab.addEventListener("keydown", (event) => {
      const rtl = document.documentElement.dir === "rtl";
      let next = null;

      if (event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
        next = (i + 1) % tabs.length;
      } else if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
        next = (i - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = tabs.length - 1;
      }

      if (next !== null) {
        event.preventDefault();
        selectTab(next, true);
      }
    });
  });

  /* -------------------------------------------------------
     Staggered reveal for grouped items ([data-stagger]).
     Content stays visible if JS or IntersectionObserver fails.
     ------------------------------------------------------- */
  if ("IntersectionObserver" in window && canAnimate) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (!reduceMotion.matches) {
          [...entry.target.children].forEach((child, i) => {
            child.animate(
              [
                { opacity: 0, transform: "translateY(28px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: 650,
                delay: i * 110,
                easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
                fill: "backwards"
              }
            );
          });
        }

        staggerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll("[data-stagger]").forEach((group) => staggerObserver.observe(group));
  }

  /* -------------------------------------------------------
     Scroll-driven effects: process progress line + parallax
     ------------------------------------------------------- */
  const steps = document.querySelector(".fo-steps");
  const stepItems = steps ? [...steps.querySelectorAll(".fo-step")] : [];
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;

    if (steps) {
      const rect = steps.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh * 0.75 - rect.top) / (rect.height + vh * 0.1)));
      steps.style.setProperty("--p", progress.toFixed(3));

      stepItems.forEach((step, i) => {
        const threshold = (i + 0.4) / stepItems.length;
        step.classList.toggle("is-done", progress >= threshold * 0.95);
      });
    }

    if (!reduceMotion.matches) {
      parallaxItems.forEach((item) => {
        const rect = item.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) * Number(item.dataset.parallax);
        item.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  /* -------------------------------------------------------
     Smooth hand-off for in-page links (#process, #occasions)
     ------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });
})();