"use strict";

(() => {
    const root = document.documentElement;
    const body = document.body;

    const header = document.getElementById("site-header");
    const headerShell = header.querySelector(".header-shell");
    const panel = document.getElementById("header-panel");
    const mobileButton = document.getElementById("mobile-menu-toggle");

    const homeButton = document.getElementById("home-trigger");
    const homeOptions = document.getElementById("home-options");
    const homeDropdown = homeButton.closest(".home-dropdown");

    const themeButton = document.getElementById("theme-toggle");
    const directionButton = document.getElementById("direction-toggle");

    const desktopQuery = window.matchMedia("(min-width: 1200px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function savePreference(key, value) {
        try { localStorage.setItem(key, value); } catch (_) { }
    }

    function renderIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function setButtonIcon(button, name) {
        const placeholder = document.createElement("i");
        placeholder.dataset.lucide = name;
        placeholder.setAttribute("aria-hidden", "true");
        button.replaceChildren(placeholder);
        placeholder.textContent = { moon: "☾", sun: "☀", menu: "☰", x: "×" }[name] || "";
        renderIcons();
    }

    /* ---------------- Home dropdown ---------------- */
    function homeIsOpen() { return homeButton.getAttribute("aria-expanded") === "true"; }

    function setHomeOpen(open, returnFocus = false) {
        homeButton.setAttribute("aria-expanded", String(open));
        homeOptions.hidden = !open;
        if (returnFocus) homeButton.focus();
    }

    homeButton.addEventListener("click", () => setHomeOpen(!homeIsOpen()));

    const homeLinks = [...homeOptions.querySelectorAll("a")];

    homeButton.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setHomeOpen(true);
            homeLinks[event.key === "ArrowDown" ? 0 : homeLinks.length - 1].focus();
        }
    });

    homeOptions.addEventListener("keydown", (event) => {
        const index = homeLinks.indexOf(document.activeElement);
        if (index < 0) return;
        let next;
        if (event.key === "ArrowDown") next = (index + 1) % homeLinks.length;
        else if (event.key === "ArrowUp") next = (index - 1 + homeLinks.length) % homeLinks.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = homeLinks.length - 1;
        if (next !== undefined) { event.preventDefault(); homeLinks[next].focus(); }
    });

    homeDropdown.addEventListener("focusout", (event) => {
        if (!homeDropdown.contains(event.relatedTarget)) setHomeOpen(false);
    });

    /* ---------------- Mobile navigation ---------------- */
    function mobileIsOpen() { return mobileButton.getAttribute("aria-expanded") === "true"; }

    function updateHeaderHeight() {
        const height = mobileIsOpen() && !desktopQuery.matches
            ? 76
            : Math.round(headerShell.getBoundingClientRect().height + 1);
        root.style.setProperty("--header-height", `${height}px`);
    }

    function setMobileOpen(open, returnFocus = false) {
        if (desktopQuery.matches) {
            panel.hidden = false;
            mobileButton.hidden = true;
            mobileButton.setAttribute("aria-expanded", "false");
            return;
        }
        panel.hidden = !open;
        mobileButton.setAttribute("aria-expanded", String(open));
        mobileButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        setButtonIcon(mobileButton, open ? "x" : "menu");
        if (!open) setHomeOpen(false);
        if (returnFocus) mobileButton.focus();
        updateHeaderHeight();
    }

    function syncNavigationLayout() {
        const focused = document.activeElement;
        if (desktopQuery.matches) {
            panel.hidden = false;
            if (focused === mobileButton) homeButton.focus();
            mobileButton.hidden = true;
            mobileButton.setAttribute("aria-expanded", "false");
            setHomeOpen(false);
        } else {
            mobileButton.hidden = false;
            if (panel.contains(focused)) mobileButton.focus();
            setMobileOpen(false);
        }
        updateHeaderHeight();
    }

    mobileButton.addEventListener("click", () => setMobileOpen(!mobileIsOpen()));

    panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (!desktopQuery.matches) setMobileOpen(false);
            setHomeOpen(false);
        });
    });

    document.addEventListener("click", (event) => {
        if (!homeDropdown.contains(event.target)) setHomeOpen(false);
        if (!desktopQuery.matches && mobileIsOpen() && !header.contains(event.target)) {
            setMobileOpen(false, panel.contains(document.activeElement));
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (homeIsOpen()) {
            event.preventDefault();
            setHomeOpen(false, homeDropdown.contains(document.activeElement));
        } else if (!desktopQuery.matches && mobileIsOpen()) {
            event.preventDefault();
            setMobileOpen(false, true);
        }
    });

    header.addEventListener("focusout", (event) => {
        if (!desktopQuery.matches && mobileIsOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) {
            setMobileOpen(false);
        }
    });

    /* ---------------- Theme ---------------- */
    function applyTheme(theme, persist = false) {
        const dark = theme === "dark";
        root.dataset.theme = dark ? "dark" : "light";
        themeButton.setAttribute("aria-pressed", String(dark));
        themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
        themeButton.title = dark ? "Light mode" : "Dark mode";
        setButtonIcon(themeButton, dark ? "sun" : "moon");
        if (persist) savePreference("sweetshop-theme", root.dataset.theme);
    }

    themeButton.addEventListener("click", () => {
        applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });

    /* ---------------- Direction ---------------- */
    function applyDirection(direction, persist = false) {
        const rtl = direction === "rtl";
        document.getElementById("bootstrap-ltr").disabled = rtl;
        document.getElementById("bootstrap-rtl").disabled = !rtl;
        root.dir = rtl ? "rtl" : "ltr";
        directionButton.setAttribute("aria-pressed", String(rtl));
        directionButton.setAttribute("aria-label", rtl ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
        directionButton.title = rtl ? "Switch to LTR" : "Switch to RTL";
        if (persist) savePreference("sweetshop-direction", root.dir);
    }

    directionButton.addEventListener("click", () => {
        applyDirection(root.dir === "rtl" ? "ltr" : "rtl", true);
    });

    /* ---------------- Image fallback ---------------- */
    const fallbackSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#f5f1eb"/>
      <rect x="40" y="40" width="720" height="520" rx="24" fill="none" stroke="#D6A647" stroke-width="2"/>
      <g fill="none" stroke="#7A2435" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M300 275h200v50H300z"/>
        <path d="M320 325v115h160V325M400 275v165"/>
        <path d="M345 275c-55-80 35-115 55-15 20-100 110-65 55 15"/>
        <path d="m365 190 35-50 35 50-35 45z"/>
      </g>
    </svg>`;
    const fallbackUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;

    function replaceFailedImage(image) {
        if (image.dataset.fallbackApplied === "true") return;
        image.dataset.fallbackApplied = "true";
        const alt = image.getAttribute("alt");
        if (alt) image.alt = `${alt}. Photograph unavailable; gift symbol shown.`;
        image.removeAttribute("srcset");
        image.src = fallbackUrl;
    }

    document.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => replaceFailedImage(image), { once: true });
        if (image.complete && image.naturalWidth === 0) replaceFailedImage(image);
    });

    /* ---------------- Scroll reveals (staggered) ---------------- */
    function initializeReveals() {
        if (reducedMotion.matches || !("IntersectionObserver" in window) ||
            typeof Element.prototype.animate !== "function") return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.animate(
                    [
                        { opacity: 0, transform: "translateY(28px)" },
                        { opacity: 1, transform: "translateY(0)" }
                    ],
                    {
                        duration: 750,
                        delay: Number(entry.target.dataset.delay || 0),
                        easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
                        fill: "backwards"
                    }
                );
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }

    reducedMotion.addEventListener("change", () => {
        if (reducedMotion.matches && document.getAnimations) {
            document.getAnimations().forEach((a) => a.cancel());
        }
    });

    /* ---------------- Hero pointer parallax ---------------- */
    function initializeHeroParallax() {
        const hero = document.getElementById("h2-hero");
        const layers = [...hero.querySelectorAll("[data-depth]")];
        if (!layers.length || reducedMotion.matches) return;
        if (!window.matchMedia("(hover: hover)").matches) return;

        hero.addEventListener("pointermove", (event) => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            layers.forEach((layer) => {
                const depth = Number(layer.dataset.depth);
                layer.style.transform = `translate3d(${x * depth * -1}px, ${y * depth * -1}px, 0)`;
            });
        });

        hero.addEventListener("pointerleave", () => {
            layers.forEach((layer) => { layer.style.transform = ""; });
        });
    }

    /* ---------------- Collections: expanding panels ---------------- */
    function initializePanels() {
        const panels = [...document.querySelectorAll(".h2-panel")];

        function activate(target) {
            panels.forEach((p) => p.classList.toggle("is-active", p === target));
        }

        panels.forEach((p) => {
            p.addEventListener("mouseenter", () => {
                if (window.matchMedia("(hover: hover)").matches) activate(p);
            });
            p.addEventListener("focus", () => activate(p));
            p.addEventListener("click", (event) => {
                // On touch devices, the first tap opens the panel; the second follows the link.
                if (!p.classList.contains("is-active")) {
                    event.preventDefault();
                    activate(p);
                }
            });
        });
    }

    /* ---------------- Gifting tabs ---------------- */
    function initializeTabs() {
        const tabs = [...document.querySelectorAll(".h2-tab")];
        const panes = [...document.querySelectorAll(".h2-tabpanel")];

        function select(index, focus = false) {
            tabs.forEach((tab, i) => {
                const active = i === index;
                tab.classList.toggle("is-active", active);
                tab.setAttribute("aria-selected", String(active));
                tab.tabIndex = active ? 0 : -1;
                panes[i].hidden = !active;
                panes[i].classList.toggle("is-active", active);
            });
            if (focus) tabs[index].focus();
        }

        tabs.forEach((tab, i) => {
            tab.addEventListener("click", () => select(i));
            tab.addEventListener("keydown", (event) => {
                const rtl = root.dir === "rtl";
                const last = tabs.length - 1;
                let next;
                if (event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = i === last ? 0 : i + 1;
                else if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = i === 0 ? last : i - 1;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = last;
                if (next !== undefined) { event.preventDefault(); select(next, true); }
            });
        });
    }

    /* ---------------- Festival banner parallax ---------------- */
    function initializeBannerParallax() {
        const bg = document.getElementById("h2-fest-bg");
        if (!bg || reducedMotion.matches) return;
        const section = bg.closest(".h2-festival");
        let ticking = false;

        function update() {
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;
            if (rect.bottom > 0 && rect.top < vh) {
                const progress = (vh - rect.top) / (vh + rect.height) - 0.5;
                bg.style.transform = `translate3d(0, ${progress * -80}px, 0)`;
            }
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }

    /* ---------------- FAQ (one open at a time) ---------------- */
    const faqItems = [...document.querySelectorAll(".h2-faq-item")];

    faqItems.forEach((item) => {
        const summary = item.querySelector("summary");
        const sync = () => summary.setAttribute("aria-expanded", String(item.open));
        sync();

        item.addEventListener("toggle", () => {
            sync();
            if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
        });
    });

    /* ---------------- Initialize ---------------- */
    body.classList.add("enhanced");

    themeButton.hidden = false;
    directionButton.hidden = false;

    setHomeOpen(false);
    applyTheme(root.dataset.theme);
    applyDirection(root.dir);
    syncNavigationLayout();
    renderIcons();
    initializeReveals();
    initializeHeroParallax();
    initializePanels();
    initializeTabs();
    initializeBannerParallax();

    desktopQuery.addEventListener("change", syncNavigationLayout);

    if ("ResizeObserver" in window) {
        new ResizeObserver(updateHeaderHeight).observe(headerShell);
    } else {
        window.addEventListener("resize", updateHeaderHeight);
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateHeaderHeight);
    }

    document.getElementById("copyright-year").textContent = String(new Date().getFullYear());
})();