"use strict";

(() => {
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);

  /* -------------------------------------------------------
     Catalog — sample prices and pack sizes.
     Replace with confirmed catalog information.
     ------------------------------------------------------- */
  const WIKI = "https://upload.wikimedia.org/wikipedia/commons/";

  const PRODUCTS = [
    {
      id: "kaju-katli", category: "sweets", label: "Cashew classic", name: "Kaju Katli",
      desc: "Delicate cashew sweetness with a smooth, tender bite.",
      img: WIKI + "a/ac/Kaju_katli_sweet.jpg", alt: "Diamond-shaped kaju katli with a silver finish",
      sizes: [["250", "250 g", 260], ["500", "500 g", 500], ["1000", "1 kg", 980]]
    },
    {
      id: "motichoor-laddu", category: "sweets", label: "Celebration favorite", name: "Motichoor Laddu",
      desc: "Fine boondi pearls brought together in a festive classic.",
      img: WIKI + "c/c3/Motichur_Laddu_%281%29.jpg", alt: "Round motichoor laddus made from fine boondi",
      sizes: [["250", "250 g", 150], ["500", "500 g", 290], ["1000", "1 kg", 560]]
    },
    {
      id: "mysore-pak", category: "sweets", label: "Southern tradition", name: "Mysore Pak",
      desc: "A rich gram-flour sweet with a distinctive crumbly texture.",
      img: WIKI + "f/ff/Mysore_pak.jpg", alt: "Rectangular pieces of Mysore pak on a banana leaf",
      sizes: [["250", "250 g", 190], ["500", "500 g", 370], ["1000", "1 kg", 720]]
    },
    {
      id: "savory-mix", category: "savories", label: "Tea-time companion", name: "Traditional Savory Mix",
      desc: "A lively mix of crisp textures and savory seasoning.",
      img: WIKI + "c/c6/Bombaymix.jpg", alt: "Savory mix with sev, nuts and crunchy pieces",
      sizes: [["200", "200 g", 90], ["500", "500 g", 210], ["1000", "1 kg", 400]]
    },
    {
      id: "mixed-dry-fruits", category: "dry-fruits", label: "Nutty textures", name: "Mixed Dry Fruits",
      desc: "A handful-ready assortment of nuts for snacking or gifting.",
      img: WIKI + "9/97/MixedNuts.JPG", alt: "An assortment of shelled nuts in a bowl",
      sizes: [["250", "250 g", 320], ["500", "500 g", 620], ["1000", "1 kg", 1200]]
    },
    {
      id: "sweet-savory-box", category: "gift-boxes", label: "Thoughtful gifting", name: "Sweet & Savory Gift Box",
      desc: "Mysore pak and savory thattai, arranged together for sharing.",
      img: WIKI + "0/08/Box_with_savories_and_sweets_on_a_plain_background.jpg",
      alt: "Open box with Mysore pak and savory thattai",
      sizes: [["small", "Small box", 399], ["medium", "Medium box", 699], ["large", "Large box", 1199]]
    }
  ];

  const EXTRAS = [
    { id: "gift-wrap", label: "Gift wrap", price: 40 },
    { id: "greeting-note", label: "Handwritten greeting note", price: 30 },
    { id: "sealed-pack", label: "Sealed travel pack", price: 25 }
  ];

  const FREE_PACKING_FROM = 999;
  const PACKING_FEE = 49;
  const MAX_QTY = 20;
  const STORAGE_KEY = "sweetshop-order";

  const productById = (id) => PRODUCTS.find((p) => p.id === id);
  const extraById = (id) => EXTRAS.find((e) => e.id === id);

  const money = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  });
  const fmt = (n) => money.format(n);

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* ignore */ }
  }

  /* -------------------------------------------------------
     Theme and direction (same keys as the home page)
     ------------------------------------------------------- */
  const themeButton = $("theme-toggle");
  const directionButton = $("direction-toggle");

  function applyTheme(theme, persist = false) {
    const dark = theme === "dark";
    root.dataset.theme = dark ? "dark" : "light";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeButton.title = dark ? "Light mode" : "Dark mode";
    themeButton.innerHTML = `<i class="bi ${dark ? "bi-sun" : "bi-moon-stars"}" aria-hidden="true"></i>`;
    if (persist) savePreference("sweetshop-theme", root.dataset.theme);
  }

  function applyDirection(direction, persist = false) {
    const rtl = direction === "rtl";
    $("bootstrap-ltr").disabled = rtl;
    $("bootstrap-rtl").disabled = !rtl;
    root.dir = rtl ? "rtl" : "ltr";
    directionButton.setAttribute("aria-pressed", String(rtl));
    directionButton.setAttribute("aria-label", rtl ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
    directionButton.title = rtl ? "Switch to LTR" : "Switch to RTL";
    if (persist) savePreference("sweetshop-direction", root.dir);
  }

  themeButton.addEventListener("click", () =>
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true));
  directionButton.addEventListener("click", () =>
    applyDirection(root.dir === "rtl" ? "ltr" : "rtl", true));

  /* -------------------------------------------------------
     Image fallback (embedded, no extra request)
     ------------------------------------------------------- */
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#f5f1eb"/>
    <rect x="40" y="40" width="720" height="520" rx="24" fill="none" stroke="#D6A647" stroke-width="2"/>
    <g fill="none" stroke="#7A2435" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M300 275h200v50H300z"/><path d="M320 325v115h160V325M400 275v165"/>
      <path d="M345 275c-55-80 35-115 55-15 20-100 110-65 55 15"/>
    </g></svg>`;
  const fallbackUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;

  function guardImage(image) {
    const swap = () => {
      if (image.dataset.fallbackApplied === "true") return;
      image.dataset.fallbackApplied = "true";
      image.src = fallbackUrl;
    };
    image.addEventListener("error", swap, { once: true });
    if (image.complete && image.naturalWidth === 0 && image.getAttribute("src")) swap();
  }

  /* -------------------------------------------------------
     Product grid and filters
     ------------------------------------------------------- */
  const grid = $("product-grid");
  let activeFilter = "all";

  function renderProducts() {
    const list = PRODUCTS.filter((p) => activeFilter === "all" || p.category === activeFilter);
    grid.innerHTML = list.map((p) => `
      <article class="pick-card">
        <div class="pick-image">
          <img src="${p.img}" alt="${escapeHtml(p.alt)}" width="800" height="600" loading="lazy" decoding="async">
        </div>
        <div class="pick-body">
          <p class="product-category">${escapeHtml(p.label)}</p>
          <h3>${escapeHtml(p.name)}</h3>
          <p class="pick-desc">${escapeHtml(p.desc)}</p>
          <p class="pick-price"><small>From</small> ${fmt(p.sizes[0][2])}</p>
          <button class="button button-secondary" type="button" data-product="${p.id}"
                  aria-label="Customize ${escapeHtml(p.name)}">Customize</button>
        </div>
      </article>`).join("");
    grid.querySelectorAll("img").forEach(guardImage);
  }

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      document.querySelectorAll(".filter-chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(c === chip)));
      renderProducts();
    });
  });

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-product]");
    if (button) openCustomize(button.dataset.product, button);
  });

  /* -------------------------------------------------------
     Customize dialog
     ------------------------------------------------------- */
  const dialog = $("customize-dialog");
  const sizeBox = $("size-options");
  const extraBox = $("extra-options");
  let current = null;
  let qty = 1;
  let opener = null;

  function openCustomize(productId, trigger) {
    current = productById(productId);
    if (!current) return;
    opener = trigger || null;
    qty = 1;

    $("modal-title").textContent = current.name;
    $("modal-category").textContent = current.label;
    const img = $("modal-image");
    delete img.dataset.fallbackApplied;
    img.src = current.img;
    img.alt = "";
    guardImage(img);

    sizeBox.innerHTML = current.sizes.map(([id, label, price], i) => `
      <label class="choice">
        <input type="radio" name="size" value="${id}" ${i === 0 ? "checked" : ""}>
        <span>${escapeHtml(label)}</span>
        <span class="choice-price">${fmt(price)}</span>
      </label>`).join("");

    extraBox.innerHTML = EXTRAS.map((e) => `
      <label class="choice">
        <input type="checkbox" name="extra" value="${e.id}">
        <span>${escapeHtml(e.label)}</span>
        <span class="choice-price">+ ${fmt(e.price)}</span>
      </label>`).join("");

    updateModalTotal();
    dialog.showModal();
  }

  function selectedSize() {
    const value = sizeBox.querySelector("input:checked").value;
    return current.sizes.find((s) => s[0] === value);
  }

  function selectedExtras() {
    return [...extraBox.querySelectorAll("input:checked")].map((i) => i.value);
  }

  function unitPrice(size, extraIds) {
    return size[2] + extraIds.reduce((sum, id) => sum + (extraById(id)?.price || 0), 0);
  }

  function updateModalTotal() {
    $("qty-value").textContent = String(qty);
    $("modal-total").textContent = fmt(unitPrice(selectedSize(), selectedExtras()) * qty);
  }

  sizeBox.addEventListener("change", updateModalTotal);
  extraBox.addEventListener("change", updateModalTotal);
  $("qty-minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); updateModalTotal(); });
  $("qty-plus").addEventListener("click", () => { qty = Math.min(MAX_QTY, qty + 1); updateModalTotal(); });

  $("modal-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { if (opener && document.contains(opener)) opener.focus(); });

  $("add-to-order").addEventListener("click", () => {
    const size = selectedSize();
    const extras = selectedExtras().sort();
    addToCart(current.id, size[0], extras, qty);
    announce(`${current.name} added to your order.`);
    dialog.close();
  });

  /* -------------------------------------------------------
     Cart
     ------------------------------------------------------- */
  let cart = loadCart();

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter((item) => {
        const p = productById(item.productId);
        return p && p.sizes.some((s) => s[0] === item.sizeId) &&
          Array.isArray(item.extras) && item.extras.every((e) => extraById(e)) &&
          Number.isInteger(item.qty) && item.qty > 0 && item.qty <= MAX_QTY;
      });
    } catch (_) { return []; }
  }

  function saveCart() { savePreference(STORAGE_KEY, JSON.stringify(cart)); }

  const keyOf = (productId, sizeId, extras) => `${productId}|${sizeId}|${extras.join(",")}`;

  function addToCart(productId, sizeId, extras, amount) {
    const key = keyOf(productId, sizeId, extras);
    const existing = cart.find((i) => keyOf(i.productId, i.sizeId, i.extras) === key);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + amount);
    else cart.push({ productId, sizeId, extras, qty: amount });
    saveCart();
    renderCart();
  }

  function lineOf(item) {
    const p = productById(item.productId);
    const size = p.sizes.find((s) => s[0] === item.sizeId);
    return { p, size, total: unitPrice(size, item.extras) * item.qty };
  }

  function announce(text) {
    const status = $("live-status");
    status.textContent = "";
    setTimeout(() => { status.textContent = text; }, 30);
  }

  const itemsList = $("order-items");

  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const subtotal = cart.reduce((sum, i) => sum + lineOf(i).total, 0);
    const packing = subtotal === 0 || subtotal >= FREE_PACKING_FROM ? 0 : PACKING_FEE;
    const total = subtotal + packing;

    itemsList.hidden = cart.length === 0;
    $("order-empty").hidden = cart.length > 0;

    itemsList.innerHTML = cart.map((item, index) => {
      const { p, size, total: line } = lineOf(item);
      const extras = item.extras.map((id) => extraById(id).label);
      const meta = [size[1], ...extras].join(" · ");
      return `
        <li class="order-item">
          <img src="${p.img}" alt="" width="56" height="56" loading="lazy">
          <div>
            <div class="item-name">${escapeHtml(p.name)}</div>
            <div class="item-meta">${escapeHtml(meta)}</div>
          </div>
          <div class="item-price">${fmt(line)}</div>
          <div class="item-actions">
            <div class="mini-stepper" role="group" aria-label="Quantity for ${escapeHtml(p.name)}">
              <button type="button" data-act="dec" data-index="${index}" aria-label="Decrease quantity"><i class="bi bi-dash" aria-hidden="true"></i></button>
              <output>${item.qty}</output>
              <button type="button" data-act="inc" data-index="${index}" aria-label="Increase quantity"><i class="bi bi-plus" aria-hidden="true"></i></button>
            </div>
            <button class="remove-item" type="button" data-act="remove" data-index="${index}"
                    aria-label="Remove ${escapeHtml(p.name)}"><i class="bi bi-trash3" aria-hidden="true"></i></button>
          </div>
        </li>`;
    }).join("");
    itemsList.querySelectorAll("img").forEach(guardImage);

    $("order-count").textContent = String(count);
    $("order-count").setAttribute("aria-label", `${count} ${count === 1 ? "item" : "items"}`);
    $("subtotal").textContent = fmt(subtotal);
    $("packing").textContent = subtotal === 0 ? fmt(0) : packing === 0 ? "Free" : fmt(packing);
    $("total").textContent = fmt(total);
    $("mobile-count").textContent = `${count} ${count === 1 ? "item" : "items"}`;
    $("mobile-total").textContent = fmt(total);
    $("place-order").disabled = cart.length === 0;
  }

  itemsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-act]");
    if (!button) return;
    const index = Number(button.dataset.index);
    const item = cart[index];
    if (!item) return;

    if (button.dataset.act === "inc") item.qty = Math.min(MAX_QTY, item.qty + 1);
    if (button.dataset.act === "dec") item.qty = Math.max(1, item.qty - 1);
    if (button.dataset.act === "remove") {
      cart.splice(index, 1);
      announce(`${productById(item.productId).name} removed from your order.`);
    }
    saveCart();
    renderCart();

    // Keep keyboard focus on the same control after re-rendering.
    const next = itemsList.querySelector(`[data-act="${button.dataset.act}"][data-index="${index}"]`);
    (next || $("place-order")).focus?.();
  });

  /* -------------------------------------------------------
     Place order (demo)
     ------------------------------------------------------- */
  const success = $("success-dialog");

  $("place-order").addEventListener("click", () => {
    if (!cart.length) return;
    cart = [];
    saveCart();
    renderCart();
    success.showModal();
  });

  success.addEventListener("click", (event) => { if (event.target === success) success.close(); });

  /* -------------------------------------------------------
     Initialize
     ------------------------------------------------------- */
  document.body.classList.add("enhanced");
  themeButton.hidden = false;
  directionButton.hidden = false;
  applyTheme(root.dataset.theme);
  applyDirection(root.dir);
  renderProducts();
  renderCart();
})();