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
        try {
            localStorage.setItem(key, value);
        } catch (_) {
            // Browsing restrictions should never prevent the controls from working.
        }
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

        // Readable local fallback if the icon CDN is unavailable.
        placeholder.textContent = {
            moon: "☾",
            sun: "☀",
            menu: "☰",
            x: "×"
        }[name] || "";

        renderIcons();
    }

    /* -------------------------------------------------------
       Home dropdown: disclosure navigation, not an ARIA menu.
       Native links preserve familiar Tab navigation.
       ------------------------------------------------------- */
    function homeIsOpen() {
        return homeButton.getAttribute("aria-expanded") === "true";
    }

    function setHomeOpen(open, returnFocus = false) {
        homeButton.setAttribute("aria-expanded", String(open));
        homeOptions.hidden = !open;

        if (returnFocus) homeButton.focus();
    }

    homeButton.addEventListener("click", () => {
        setHomeOpen(!homeIsOpen());
    });

    const homeLinks = [...homeOptions.querySelectorAll("a")];

    homeButton.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setHomeOpen(true);
            const index = event.key === "ArrowDown" ? 0 : homeLinks.length - 1;
            homeLinks[index].focus();
        }
    });

    homeOptions.addEventListener("keydown", (event) => {
        const index = homeLinks.indexOf(document.activeElement);
        if (index < 0) return;

        let nextIndex;

        if (event.key === "ArrowDown") {
            nextIndex = (index + 1) % homeLinks.length;
        } else if (event.key === "ArrowUp") {
            nextIndex = (index - 1 + homeLinks.length) % homeLinks.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = homeLinks.length - 1;
        }

        if (nextIndex !== undefined) {
            event.preventDefault();
            homeLinks[nextIndex].focus();
        }
    });

    homeDropdown.addEventListener("focusout", (event) => {
        if (!homeDropdown.contains(event.relatedTarget)) {
            setHomeOpen(false);
        }
    });

    /* -------------------------------------------------------
       Responsive mobile navigation
       ------------------------------------------------------- */
    function mobileIsOpen() {
        return mobileButton.getAttribute("aria-expanded") === "true";
    }

    function updateHeaderHeight() {
        // Expanded mobile menus must not change the hero's base header offset.
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
        mobileButton.setAttribute(
            "aria-label",
            open ? "Close navigation" : "Open navigation"
        );

        setButtonIcon(mobileButton, open ? "x" : "menu");

        if (!open) setHomeOpen(false);
        if (returnFocus) mobileButton.focus();

        updateHeaderHeight();
    }

    function syncNavigationLayout() {
        // Move focus before hiding a control or panel at a breakpoint.
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

    mobileButton.addEventListener("click", () => {
        setMobileOpen(!mobileIsOpen());
    });

    panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (!desktopQuery.matches) setMobileOpen(false);
            setHomeOpen(false);
        });
    });

    document.addEventListener("click", (event) => {
        if (!homeDropdown.contains(event.target)) {
            setHomeOpen(false);
        }

        if (
            !desktopQuery.matches &&
            mobileIsOpen() &&
            !header.contains(event.target)
        ) {
            const focusWasInside = panel.contains(document.activeElement);
            setMobileOpen(false, focusWasInside);
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

    // Close the mobile disclosure after keyboard focus leaves the header.
    header.addEventListener("focusout", (event) => {
        if (
            !desktopQuery.matches &&
            mobileIsOpen() &&
            event.relatedTarget &&
            !header.contains(event.relatedTarget)
        ) {
            setMobileOpen(false);
        }
    });

    /* -------------------------------------------------------
       Theme
       ------------------------------------------------------- */
    function applyTheme(theme, persist = false) {
        const dark = theme === "dark";

        root.dataset.theme = dark ? "dark" : "light";
        themeButton.setAttribute("aria-pressed", String(dark));
        themeButton.setAttribute(
            "aria-label",
            dark ? "Switch to light mode" : "Switch to dark mode"
        );
        themeButton.title = dark ? "Light mode" : "Dark mode";
        setButtonIcon(themeButton, dark ? "sun" : "moon");

        if (persist) savePreference("sweetshop-theme", root.dataset.theme);
    }

    themeButton.addEventListener("click", () => {
        applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });

    /* -------------------------------------------------------
       Direction and matching Bootstrap stylesheet
       ------------------------------------------------------- */
    function applyDirection(direction, persist = false) {
        const rtl = direction === "rtl";

        document.getElementById("bootstrap-ltr").disabled = rtl;
        document.getElementById("bootstrap-rtl").disabled = !rtl;

        root.dir = rtl ? "rtl" : "ltr";

        directionButton.setAttribute("aria-pressed", String(rtl));
        directionButton.setAttribute(
            "aria-label",
            rtl
                ? "Switch to left-to-right layout"
                : "Switch to right-to-left layout"
        );
        directionButton.title = rtl ? "Switch to LTR" : "Switch to RTL";

        if (persist) savePreference("sweetshop-direction", root.dir);
    }

    directionButton.addEventListener("click", () => {
        applyDirection(root.dir === "rtl" ? "ltr" : "rtl", true);
    });

    /* -------------------------------------------------------
       Accessible FAQ
       Native details/summary supplies keyboard operation.
       Explicit expanded states stay synchronized.
       ------------------------------------------------------- */
    const faqItems = [...document.querySelectorAll(".faq-item")];

    faqItems.forEach((item) => {
        const summary = item.querySelector("summary");

        function syncExpanded() {
            summary.setAttribute("aria-expanded", String(item.open));
        }

        syncExpanded();

        item.addEventListener("toggle", () => {
            syncExpanded();

            if (item.open) {
                faqItems.forEach((other) => {
                    if (other !== item) other.open = false;
                });
            }
        });
    });

    /* -------------------------------------------------------
       Local, embedded image fallback.
       No external fallback request and no retry loop.
       ------------------------------------------------------- */
    const fallbackSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#f5f1eb"/>
      <rect x="40" y="40" width="720" height="520" rx="24"
            fill="none" stroke="#D6A647" stroke-width="2"/>
      <g fill="none" stroke="#7A2435" stroke-width="7"
         stroke-linecap="round" stroke-linejoin="round">
        <path d="M300 275h200v50H300z"/>
        <path d="M320 325v115h160V325M400 275v165"/>
        <path d="M345 275c-55-80 35-115 55-15
                 20-100 110-65 55 15"/>
        <path d="m365 190 35-50 35 50-35 45z"/>
      </g>
    </svg>
  `;

    const fallbackUrl =
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;

    function replaceFailedImage(image) {
        if (image.dataset.fallbackApplied === "true") return;

        image.dataset.fallbackApplied = "true";
        const originalAlt = image.getAttribute("alt") || "Product photograph";
        image.alt = `${originalAlt}. Photograph unavailable; gift symbol shown.`;
        image.removeAttribute("srcset");
        image.src = fallbackUrl;
    }

    document.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => replaceFailedImage(image), {
            once: true
        });

        // Handles failures that occurred before this deferred script executed.
        if (image.complete && image.naturalWidth === 0) {
            replaceFailedImage(image);
        }
    });

    /* -------------------------------------------------------
       Scroll reveals
       No CSS class hides content. If JS stops, content remains
       visible. Reduced-motion users receive no reveal animation.
       ------------------------------------------------------- */
    function initializeReveals() {
        if (
            reducedMotion.matches ||
            !("IntersectionObserver" in window) ||
            typeof Element.prototype.animate !== "function"
        ) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                if (!reducedMotion.matches) {
                    entry.target.animate(
                        [
                            { opacity: 0, transform: "translateY(16px)" },
                            { opacity: 1, transform: "translateY(0)" }
                        ],
                        {
                            duration: 550,
                            easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
                            fill: "none"
                        }
                    );
                }

                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll(".reveal").forEach((element) => {
            observer.observe(element);
        });
    }

    reducedMotion.addEventListener("change", () => {
        if (reducedMotion.matches && document.getAnimations) {
            document.getAnimations().forEach((animation) => animation.cancel());
        }
    });

    /* -------------------------------------------------------
       Initialize progressive enhancements
       ------------------------------------------------------- */
    body.classList.add("enhanced");

    themeButton.hidden = false;
    directionButton.hidden = false;

    setHomeOpen(false);
    applyTheme(root.dataset.theme);
    applyDirection(root.dir);
    syncNavigationLayout();
    renderIcons();
    initializeReveals();

    desktopQuery.addEventListener("change", syncNavigationLayout);

    if ("ResizeObserver" in window) {
        new ResizeObserver(updateHeaderHeight).observe(headerShell);
    } else {
        window.addEventListener("resize", updateHeaderHeight);
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateHeaderHeight);
    }

    document.getElementById("copyright-year").textContent =
        String(new Date().getFullYear());
})();