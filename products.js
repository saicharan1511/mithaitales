"use strict";

/* Loads after index.js (header, theme, RTL and base reveals live there). */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isRtl = () => document.documentElement.dir === "rtl";

  /* -------------------------------------------------------
     Image fallback: try a thematic backup image first.
     Capture phase runs before index.js's generic icon fallback.
     ------------------------------------------------------- */
  function useBackup(img) {
    const backup = img.dataset.fallback;
    if (!backup || img.dataset.prTried === "true") return false;
    img.dataset.prTried = "true";
    img.src = backup;
    return true;
  }

  document.addEventListener("error", (event) => {
    const img = event.target;
    if (img instanceof HTMLImageElement && useBackup(img)) {
      event.stopImmediatePropagation();
    }
  }, true);

  // Catch images that failed before this script ran.
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) useBackup(img);
  });

  /* -------------------------------------------------------
     Staggered reveal for grids and lists
     ------------------------------------------------------- */
  const staggerGroups = document.querySelectorAll("[data-stagger]");

  if (
    !reduced.matches &&
    "IntersectionObserver" in window &&
    typeof Element.prototype.animate === "function"
  ) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.querySelectorAll(".pr-st").forEach((item, i) => {
          item.animate(
            [
              { opacity: 0, transform: "translateY(34px) scale(0.97)" },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            {
              duration: 650,
              delay: i * 110,
              easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
              fill: "backwards"
            }
          );
        });

        staggerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    staggerGroups.forEach((group) => staggerObserver.observe(group));
  }

  /* -------------------------------------------------------
     Count-up statistics
     ------------------------------------------------------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || reduced.matches) return;

    el.textContent = "0";
    const duration = 1400;
    let start = null;

    const tick = (now) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    setTimeout(() => requestAnimationFrame(tick), 600);
  });

  /* -------------------------------------------------------
     Hero parallax
     ------------------------------------------------------- */
  const hero = document.querySelector(".pr-hero");
  const heroImg = hero && hero.querySelector(".pr-hero-bg img");

  if (hero && heroImg && !reduced.matches) {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (y < hero.offsetHeight + 100) {
        heroImg.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------
     Category tile cursor spotlight
     ------------------------------------------------------- */
  document.querySelectorAll(".pr-tile").forEach((tile) => {
    tile.addEventListener("pointermove", (event) => {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  /* -------------------------------------------------------
     Gift box 3D tilt (mouse only)
     ------------------------------------------------------- */
  if (!reduced.matches && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------
     Savories carousel: arrows, drag, progress bar
     ------------------------------------------------------- */
  const track = document.getElementById("sav-track");
  const prev = document.getElementById("sav-prev");
  const next = document.getElementById("sav-next");
  const bar = document.getElementById("sav-bar");

  if (track && prev && next) {
    const step = () => {
      const slide = track.querySelector(".pr-slide");
      return slide ? slide.getBoundingClientRect().width + 24 : 320;
    };

    const scrollByDir = (dir) => {
      const sign = isRtl() ? -1 : 1;
      track.scrollBy({
        left: dir * sign * step(),
        behavior: reduced.matches ? "auto" : "smooth"
      });
    };

    prev.addEventListener("click", () => scrollByDir(-1));
    next.addEventListener("click", () => scrollByDir(1));

    const updateProgress = () => {
      const max = track.scrollWidth - track.clientWidth;
      const pos = Math.abs(track.scrollLeft);
      const ratio = max > 0 ? Math.min(pos / max, 1) : 1;
      const width = Math.max(track.clientWidth / track.scrollWidth, 0.12);

      if (bar) {
        bar.style.width = `${width * 100}%`;
        const travel = (1 / width - 1) * 100 * ratio;
        bar.style.transform = `translateX(${isRtl() ? -travel : travel}%)`;
      }

      prev.disabled = pos < 4;
      next.disabled = pos > max - 4;
    };

    track.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); scrollByDir(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); scrollByDir(-1); }
    });

    // Mouse drag to scroll
    let down = false, startX = 0, startLeft = 0, moved = false;

    track.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = event.clientX;
      startLeft = track.scrollLeft;
    });

    window.addEventListener("pointermove", (event) => {
      if (!down) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 5) {
        moved = true;
        track.classList.add("is-dragging");
      }
      if (moved) track.scrollLeft = startLeft - dx;
    });

    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      setTimeout(() => track.classList.remove("is-dragging"), 0);
    });
  }

  /* -------------------------------------------------------
     ?category=sweets|savories|dry-fruits|gift-boxes
     Used by the footer and home page category links.
     ------------------------------------------------------- */
  const category = new URLSearchParams(window.location.search).get("category");
  const target = category && document.getElementById(category);

  if (target && target.hasAttribute("data-category")) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        target.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });

        if (!reduced.matches && typeof target.animate === "function") {
          target.animate(
            [
              { boxShadow: "inset 0 0 0 0 rgba(214,166,71,0)" },
              { boxShadow: "inset 0 0 0 6px rgba(214,166,71,0.55)", offset: 0.35 },
              { boxShadow: "inset 0 0 0 0 rgba(214,166,71,0)" }
            ],
            { duration: 1600, easing: "ease-out" }
          );
        }
      }, 300);
    });
  }
})();