"use strict";

(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -------------------------------------------------------
     1. Scroll reveal with staggered delay per sibling group
     Content stays visible if this script never runs.
     ------------------------------------------------------- */
  const revealItems = $$(".rv");

  revealItems.forEach((el) => {
    const group = [...el.parentElement.children].filter((c) => c.classList.contains("rv"));
    el.style.setProperty("--d", `${Math.max(group.indexOf(el), 0) * 90}ms`);
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("in"));
  } else {
    root.classList.add("rv-ready");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealItems.forEach((el) => io.observe(el));
  }

  /* -------------------------------------------------------
     2. Hero parallax + steps progress (single rAF scroll loop)
     ------------------------------------------------------- */
  const heroBg = $(".c-hero-bg");
  const hero = $(".c-hero");
  const stepsList = $("#c-steps");
  const stepsFill = $("#c-steps-fill");
  const steps = $$(".c-step");
  let ticking = false;

  function onScroll() {
    if (!reduceMotion.matches && heroBg && hero) {
      const heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom > 0) {
        heroBg.style.transform = `translate3d(0, ${Math.round(window.scrollY * 0.25)}px, 0)`;
      }
    }

    if (stepsList && stepsFill) {
      const rect = stepsList.getBoundingClientRect();
      const trigger = window.innerHeight * 0.6;
      const progress = Math.min(Math.max((trigger - rect.top) / rect.height, 0), 1);
      stepsFill.style.blockSize = `${progress * 100}%`;

      steps.forEach((step) => {
        const num = $(".c-step-num", step).getBoundingClientRect();
        step.classList.toggle("active", num.top + num.height / 2 < trigger);
      });
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* -------------------------------------------------------
     3. Enquiry form
     ------------------------------------------------------- */
  const form = $("#enquiry-form");
  const topicSelect = $("#f-topic");
  const message = $("#f-message");
  const counter = $("#msg-count");
  const formBody = $("#form-body");
  const success = $("#form-success");
  const submitBtn = $("#submit-btn");

  const validTopics = $$("option", topicSelect).map((o) => o.value).filter(Boolean);

  function setTopic(value, focusNext = false) {
    if (!validTopics.includes(value)) return;
    topicSelect.value = value;
    clearError(topicSelect);
    if (focusNext) {
      const target = !$("#f-name").value ? $("#f-name") : message;
      setTimeout(() => target.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 600);
    }
  }

  // Topic cards pre-fill the form
  $$(".c-topic").forEach((card) => {
    card.addEventListener("click", () => setTopic(card.dataset.topic, true));
  });

  // Footer / external links: contact.html?topic=bulk-orders
  try {
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) setTopic(topic);
  } catch (_) { /* ignore */ }

  // Earliest selectable date is today
  const dateInput = $("#f-date");
  if (dateInput) {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateInput.min = today.toISOString().slice(0, 10);
  }

  // Character counter
  function updateCount() {
    counter.textContent = `${message.value.length} / 600`;
  }
  message.addEventListener("input", updateCount);

  // Validation rules return true or an error message
  const rules = {
    name: (v) => v.trim().length >= 2 || "Please enter your full name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address.",
    phone: (v) => v.trim() === "" || /^[+\d][\d\s()-]{6,17}$/.test(v.trim()) || "Enter a valid phone number or leave it blank.",
    topic: (v) => v !== "" || "Please choose a topic.",
    message: (v) => v.trim().length >= 10 || "Please share a few details (at least 10 characters).",
    consent: (_, el) => el.checked || "Please confirm so we can contact you."
  };

  function errorFor(el) {
    return $(`.c-error[data-for="${el.name}"]`, form);
  }

  function clearError(el) {
    const box = errorFor(el);
    if (box) box.textContent = "";
    el.removeAttribute("aria-invalid");
    el.closest(".c-field")?.classList.remove("invalid");
  }

  function validate(el) {
    const rule = rules[el.name];
    if (!rule) return true;
    const result = rule(el.value, el);
    if (result === true) {
      clearError(el);
      return true;
    }
    errorFor(el).textContent = result;
    el.setAttribute("aria-invalid", "true");
    el.closest(".c-field")?.classList.add("invalid");
    return false;
  }

  const fields = Object.keys(rules).map((n) => form.elements[n]);

  fields.forEach((el) => {
    el.addEventListener("blur", () => validate(el));
    el.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") validate(el);
    });
    el.addEventListener("change", () => validate(el));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = fields.map((el) => validate(el));
    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      return;
    }

    const label = $(".c-btn-label", submitBtn);
    submitBtn.setAttribute("aria-busy", "true");
    label.textContent = "Sending…";

    /* EDIT: connect a real backend here, for example:
       fetch("https://your-endpoint", { method: "POST", body: new FormData(form) })
         .then(...)
       The timeout below only simulates the request. */
    setTimeout(() => {
      submitBtn.removeAttribute("aria-busy");
      label.textContent = "Send Enquiry";
      formBody.hidden = true;
      success.hidden = false;
      success.focus();
    }, 900);
  });

  form.addEventListener("reset", () => {
    fields.forEach(clearError);
    setTimeout(updateCount, 0);
  });

  $("#send-another").addEventListener("click", () => {
    form.reset();
    success.hidden = true;
    formBody.hidden = false;
    $("#f-name").focus();
  });

  /* -------------------------------------------------------
     4. FAQ chips + one-open-at-a-time
     ------------------------------------------------------- */
  const chips = $$(".c-chip");
  const qaItems = $$(".c-qa");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;

      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", String(on));
      });

      qaItems.forEach((item) => {
        const show = filter === "all" || item.dataset.cat === filter;
        item.hidden = !show;
        if (show && !item.classList.contains("in")) item.classList.add("in");
      });
    });
  });

  qaItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      qaItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();