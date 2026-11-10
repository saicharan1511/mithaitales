"use strict";
(() => {
    /* Six service cards. `slug` is passed to service-detail.html?service=<slug>,
       where service-detail.js shows only that service's content. */
    const services = [
        { slug: "celebration-gift-boxes", icon: "gift", title: "Celebration Gift Boxes", text: "Curated assortments for birthdays, housewarmings and thank-yous.", tags: ["Selections", "Box formats"] },
        { slug: "corporate-gifting", icon: "briefcase-business", title: "Corporate Gifting", text: "Consistent, well-presented gifts for clients, teams and partners.", tags: ["Quantities", "Budget plans"] },
        { slug: "bulk-orders", icon: "boxes", title: "Bulk Sweet & Savory Orders", text: "Event-sized quantities with sensible combinations and packing.", tags: ["Pack sizes", "Event planning"] },
        { slug: "wedding-favours", icon: "heart", title: "Wedding & Event Favours", text: "Elegant return gifts and hospitality boxes for your guests.", tags: ["Guest favours", "Personal notes"] },
        { slug: "festival-hampers", icon: "sparkles", title: "Festival Hampers", text: "Seasonal hampers for Diwali, Eid, Raksha Bandhan and more.", tags: ["Seasonal", "Pre-orders"] },
        { slug: "dry-fruit-gifting", icon: "nut", title: "Dry Fruit Gifting", text: "Nutty, wholesome selections arranged in premium gift packs.", tags: ["Dry fruits", "Premium packs"] }
    ];

    const grid = document.getElementById("svc-cards");
    grid.innerHTML = services.map((s, i) => `
    <div class="col-md-6 col-lg-4">
      <article class="svc-card reveal">
        <span class="svc-num" aria-hidden="true">0${i + 1}</span>
        <span class="svc-icon"><i data-lucide="${s.icon}" aria-hidden="true"></i></span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <ul class="svc-tags">${s.tags.map(t => `<li>${t}</li>`).join("")}</ul>
        <a class="button button-secondary" href="service-detail.html?service=${s.slug}"
           aria-label="View Service: ${s.title}">View Service
          <i class="directional-icon" data-lucide="arrow-right" aria-hidden="true"></i></a>
      </article>
    </div>`).join("");

    // Cursor spotlight on cards
    grid.addEventListener("pointermove", (e) => {
        const card = e.target.closest(".svc-card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });

    // Gallery lightbox
    const box = document.getElementById("lightbox");
    const big = document.getElementById("lb-img");
    document.querySelectorAll(".g-item").forEach((b) => b.addEventListener("click", () => {
        big.src = b.dataset.full;
        big.alt = b.querySelector("img").alt;
        box.showModal();
    }));
    document.getElementById("lb-close").addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
})();