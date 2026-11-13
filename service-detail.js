"use strict";
(() => {
  const W = "https://upload.wikimedia.org/wikipedia/commons/";
  const IMG = {
    box: W + "0/08/Box_with_savories_and_sweets_on_a_plain_background.jpg",
    celebrationBox: "celebration-gift-boxes.png",
    corporateGifting: "corporate-gifting.png",
    bulkOrders: "bulk-sweet-savory-orders.png",
    ladoo: W + "c/c3/Motichur_Laddu_%281%29.jpg",
    weddingFavours: "wedding-event-favours.png",
    festivalHampers: "festival-hampers.png",
    pak: W + "f/ff/Mysore_pak.jpg",
    dryFruitGifting: "dry-fruit-gifting.png"
  };
  // plans: [name, price, unit, audience]. Sample prices — replace with confirmed rates.
  const DATA = {
    "celebration-gift-boxes": {
      icon: "gift", title: "Celebration Gift Boxes", img: IMG.celebrationBox,
      tag: "Curated boxes for birthdays, housewarmings and thank-yous.",
      intro: ["A gift box turns a sweet into a gesture. We help you choose a balance of sweets and savories, then arrange them in a box that feels ready to give.", "Tell us the occasion and the person, and we will suggest selections and box formats to fit."],
      includes: ["Sweet, savory or mixed selections", "Choice of box formats", "Handwritten or printed occasion note", "Gift-ready arrangement"],
      why: [["Curated, not random", "Combinations chosen so flavors and textures complement each other."], ["Ready to gift", "Boxes arrive arranged and presentable, with no extra wrapping needed."], ["Personal touch", "Add a note or choose favorites for the person receiving it."]],
      plans: [["Petite", "₹499", "per box", "A small thank-you"], ["Classic", "₹999", "per box", "Birthdays & housewarmings"], ["Grand", "₹1,799", "per box", "Milestones & big gestures"]],
      faqs: [["Can I pick the exact sweets?", "Yes. Share your favorites and the store will confirm what can be combined in your chosen box."], ["Can you deliver to the recipient?", "Delivery arrangements are confirmed with the store when you place the enquiry."]]
    },
    "corporate-gifting": {
      icon: "briefcase-business", title: "Corporate Gifting", img: IMG.corporateGifting,
      tag: "Consistent, polished gifts for clients, teams and partners.",
      intro: ["Corporate gifts should feel considered and arrive on time. We plan identical, well-presented boxes so every recipient receives the same quality.", "Share your headcount, budget and timeline, and we will propose a selection and presentation."],
      includes: ["Uniform selections for large groups", "Company-note or sleeve options", "Budget-based recommendations", "Batch packing and scheduling"],
      why: [["Consistent quality", "Every box packed to the same standard, whether you order 20 or 200."], ["Budget aware", "Selections proposed to suit your per-gift budget."], ["Planned timelines", "Dates agreed in advance so gifts land when they should."]],
      plans: [["Team", "₹799", "per gift · 10+", "Small teams"], ["Client", "₹1,499", "per gift · 25+", "Clients & partners"], ["Executive", "₹2,999", "per gift · 10+", "Leadership gifting"]],
      faqs: [["Is there a minimum quantity?", "Minimums vary by format. The store will confirm when you share your requirement."], ["Can we add our branding?", "Branded notes or sleeves can be discussed depending on quantity and lead time."]]
    },
    "bulk-orders": {
      icon: "boxes", title: "Bulk Sweet & Savory Orders", img: IMG.bulkOrders,
      tag: "Event-sized quantities, planned and packed with care.",
      intro: ["For functions, gatherings and community events, we help you work out sensible quantities and combinations, then pack them for easy distribution.", "Share your guest count and date, and we will suggest pack sizes and product mixes."],
      includes: ["Quantity guidance by guest count", "Mixed sweet and savory combinations", "Bulk packing formats", "Advance scheduling"],
      why: [["Right-sized orders", "Avoid too little or too much with quantity guidance."], ["Flexible combinations", "Mix sweets and savories to suit your guests."], ["Easy to distribute", "Packed in formats that are simple to serve or hand out."]],
      plans: [["Gathering", "₹250", "per kg · 5 kg+", "Family functions"], ["Event", "₹230", "per kg · 20 kg+", "Community events"], ["Large Event", "Custom", "quote on request", "500+ guests"]],
      faqs: [["How far ahead should I order?", "As early as possible, and at least a few days for larger quantities. The store confirms feasibility."], ["Can I sample first?", "Ask the store about sampling when you enquire."]]
    },
    "wedding-favours": {
      icon: "heart", title: "Wedding & Event Favours", img: IMG.weddingFavours,
      tag: "Elegant return gifts and hospitality boxes for your guests.",
      intro: ["Wedding favours are the last thing guests remember. We create small, elegant packs of sweets that carry your good wishes home.", "From mehendi to reception, we can plan favours and hospitality boxes for each occasion."],
      includes: ["Guest favour boxes", "Hospitality and room hampers", "Personalised message cards", "Delivery coordination"],
      why: [["Made for guests", "Compact, attractive packs that are easy to carry."], ["Occasion-matched", "Selections and styling to suit each function."], ["Planned with you", "Quantities and dates confirmed well in advance."]],
      plans: [["Favour", "₹149", "per pack · 50+", "Return gifts"], ["Hospitality", "₹599", "per box · 20+", "Guest rooms"], ["Signature", "₹1,299", "per box · 10+", "Family & VIPs"]],
      faqs: [["Can names be added?", "Personalised cards can be discussed, depending on quantity and lead time."], ["Do you handle multiple functions?", "Yes. Share the schedule and the store can plan each delivery."]]
    },
    "festival-hampers": {
      icon: "sparkles", title: "Festival Hampers", img: IMG.festivalHampers,
      tag: "Seasonal hampers for every festival on the calendar.",
      intro: ["Festivals call for sweets that feel special. Our hampers bring together traditional favorites in festive packaging for sharing with family, friends and neighbors.", "Seasonal availability varies, so early pre-orders are recommended."],
      includes: ["Festival-themed assortments", "Sweet and savory combinations", "Festive packaging", "Pre-order scheduling"],
      why: [["Traditional flavors", "Recipes and selections that suit the occasion."], ["Festive presentation", "Hampers dressed for celebration."], ["Pre-order friendly", "Reserve early for your preferred date."]],
      plans: [["Family", "₹899", "per hamper", "Home gifting"], ["Celebration", "₹1,599", "per hamper", "Friends & relatives"], ["Royal", "₹2,799", "per hamper", "Special occasions"]],
      faqs: [["When do festival orders open?", "Timing depends on the festival. Check Festival Orders or contact the store."], ["Can I customise a hamper?", "Selections can often be adjusted. The store will confirm what is possible."]]
    },
    "dry-fruit-gifting": {
      icon: "nut", title: "Dry Fruit Gifting", img: IMG.dryFruitGifting,
      tag: "Wholesome selections arranged in premium gift packs.",
      intro: ["Dry fruits are a gift that suits almost every occasion and every age. We arrange nuts and dry fruits in tidy, attractive packs for gifting.", "Choose a ready selection or tell us your favorites for a personal mix."],
      includes: ["Nut and dry fruit selections", "Single or multi-compartment packs", "Mix with sweets on request", "Gift-ready presentation"],
      why: [["Wholesome choice", "A lighter gifting option for health-minded recipients."], ["Neatly packed", "Compartment packs keep each item fresh and tidy."], ["Pairs with sweets", "Combine with mithai for a fuller gift."]],
      plans: [["Starter", "₹699", "per pack", "Everyday gifting"], ["Premium", "₹1,399", "per pack", "Festivals & weddings"], ["Luxury", "₹2,499", "per pack", "Executive gifting"]],
      faqs: [["How is freshness maintained?", "Follow the product label for storage and best-before guidance, and ask the store if unsure."], ["Can I mix dry fruits with sweets?", "Yes, mixed packs can be discussed with the store."]]
    }
  };

  const slug = new URLSearchParams(location.search).get("service");
  const s = DATA[slug];
  const root = document.getElementById("detail-root");

  if (!s) {
    document.title = "Service not found | Mithai Tales";
    root.innerHTML = `<section class="section-space text-center"><div class="container"><h1>Service not found</h1><p>Please choose a service from our list.</p><a class="button button-primary" href="services.html">Back to Services</a></div></section>`;
    return;
  }

  document.title = `${s.title} | Mithai Tales`;
  document.querySelector('meta[name="description"]').content = s.tag;
  const c = (txt) => `<i data-lucide="check" aria-hidden="true"></i>${txt}`;
  const enquiry = `contact.html?topic=${slug}`;

  root.innerHTML = `
  <section class="sd-hero" aria-labelledby="sd-title"><div class="container">
    <div class="row align-items-center g-5">
      <div class="col-lg-6"><span class="sd-icon"><i data-lucide="${s.icon}" aria-hidden="true"></i></span>
        <p class="eyebrow">Service Details</p><h1 id="sd-title">${s.title}</h1><p class="sd-lead">${s.tag}</p>
        <div class="button-group"><a class="button button-primary" href="${enquiry}">Enquire Now <i class="directional-icon" data-lucide="arrow-up-right" aria-hidden="true"></i></a></div></div>
      <div class="col-lg-6"><figure class="sd-photo"><img src="${s.img}" alt="${s.title} — representative photograph" fetchpriority="high" decoding="async"></figure></div>
    </div></div></section>

  <section class="section-space" aria-labelledby="ctx-title"><div class="container"><div class="sd-grid">
    <div class="sd-body reveal"><p class="eyebrow">About this service</p><h2 id="ctx-title">What you can expect.</h2>
      ${s.intro.map(p => `<p>${p}</p>`).join("")}
      <ul class="check-list">${s.includes.map(i => `<li>${c(i)}</li>`).join("")}</ul></div>
    <aside class="glance reveal" aria-label="At a glance"><dl><dt>Service</dt><dd>${s.title}</dd><dt>Starting from</dt><dd>${s.plans[0][1]}</dd><dt>Planning</dt><dd>Share date &amp; quantity early</dd></dl>
      <a class="button button-primary" href="${enquiry}">Request a Quote</a></aside>
  </div></div></section>

  <section class="section-space surface-alt" aria-labelledby="why-title"><div class="container">
    <div class="section-heading text-center reveal"><p class="eyebrow">Why choose this service</p><h2 id="why-title">Made with care, planned with you.</h2></div>
    <div class="row g-4">${s.why.map((w, i) => `<div class="col-md-4"><article class="reason reveal"><span class="n">0${i + 1}</span><h3>${w[0]}</h3><p>${w[1]}</p></article></div>`).join("")}</div>
  </div></section>

  <section class="section-space" id="pricing" aria-labelledby="price-title"><div class="container">
    <div class="section-heading text-center reveal"><p class="eyebrow">Pricing</p><h2 id="price-title">Simple, starting-point pricing.</h2></div>
    <div class="row g-4 align-items-stretch">${s.plans.map((p, i) => `
      <div class="col-md-4"><article class="price-card reveal${i === 1 ? " featured" : ""}">
        ${i === 1 ? '<span class="premium-badge">Most chosen</span>' : ""}
        <h3>${p[0]}</h3><p class="amount">${p[1]} <small>${p[2]}</small></p><p class="for">${p[3]}</p>
        <ul><li>${c("Curated selection")}</li><li>${c("Gift-ready packing")}</li><li>${c("Store-confirmed availability")}</li></ul>
        <a class="button ${i === 1 ? "button-primary" : "button-secondary"}" href="${enquiry}&plan=${p[0].toLowerCase()}">Choose ${p[0]}</a></article></div>`).join("")}</div>
    <p class="price-note">Sample prices — final quotes depend on selection, quantity and packaging.</p>
  </div></section>

  <section class="section-space surface-alt faq" aria-labelledby="sdfaq-title"><div class="container"><div class="row g-5">
    <div class="col-lg-4 reveal"><p class="eyebrow">FAQs</p><h2 id="sdfaq-title">About ${s.title}.</h2><p>More questions? <a href="contact.html" style="text-decoration:underline">Contact the store</a>.</p></div>
    <div class="col-lg-8 reveal"><div class="faq-list">${s.faqs.map((f, i) => `<details class="faq-item"${i ? "" : " open"}><summary>${f[0]}<i data-lucide="plus" aria-hidden="true"></i></summary><div class="faq-answer"><p>${f[1]}</p></div></details>`).join("")}</div></div>
  </div></div></section>

  <section class="section-space"><div class="container"><div class="cta-card reveal"><span class="cta-orn" aria-hidden="true">✧</span>
    <h2>Ready for ${s.title}?</h2><p>Share your occasion, quantity and date, and the store will take it from there.</p>
    <div class="button-group justify-content-center"><a class="button button-primary" href="${enquiry}">Start an Enquiry</a><a class="button button-light" href="services.html">All Services</a></div></div></div></section>`;
})();