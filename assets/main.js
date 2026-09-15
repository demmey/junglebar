/* Jungle Bar — site behaviour */
(function () {
  const WA = "5978632450";

  /* ------------------------------------------------------------------ nav */
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  if (toggle && nav) {
    const setOpen = open => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", e => {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* --------------------------------------------- header state + progress */
  const line = document.querySelector("[data-scroll-line]");
  let frame = null;

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (line) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        line.style.setProperty("--scrolled", (max > 0 ? (y / max) * 100 : 0).toFixed(2) + "%");
      }
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --------------------------------------------------------- open status */
  // Open every day 15:00 - 02:00 (Suriname time, UTC-3).
  const statusEls = document.querySelectorAll("[data-status]");
  if (statusEls.length) {
    const now = new Date(Date.now() - 3 * 3600 * 1000); // shift to UTC-3
    const h = now.getUTCHours();
    const m = now.getUTCMinutes();
    const open = h >= 15 || h < 2;
    statusEls.forEach(el => {
      el.classList.toggle("is-open", open);
      const label = el.querySelector("[data-status-label]");
      if (!label) return;
      if (open) {
        label.textContent = "Nu open, tot 02:00";
      } else if (h < 15) {
        const mins = (15 - h) * 60 - m;
        label.textContent = mins > 90
          ? "Gesloten, open om 15:00"
          : "Open over " + mins + " min";
      } else {
        label.textContent = "Gesloten, open om 15:00";
      }
    });
  }

  /* -------------------------------------------------------------- reveal */
  const items = document.querySelectorAll(".reveal");
  if (items.length) {
    if (!window.IntersectionObserver) {
      items.forEach(i => i.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      items.forEach(i => io.observe(i));
    }
  }

  /* ------------------------------------------------------------ lightbox */
  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<button type="button" aria-label="Sluiten">&times;</button><img alt="">';
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const close = () => box.classList.remove("is-open");

    gallery.addEventListener("click", e => {
      const source = e.target.closest("img");
      if (!source) return;
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      box.classList.add("is-open");
    });
    box.addEventListener("click", e => {
      if (e.target !== img) close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") close();
    });
  }

  /* --------------------------------------------------------------- form */
  const form = document.querySelector("[data-wa-form]");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const topic = (data.get("topic") || "").toString();
      const message = (data.get("message") || "").toString().trim();
      const note = form.querySelector("[data-form-note]");

      if (!name || !message) {
        if (note) note.textContent = "Vul je naam en bericht in, dan openen we WhatsApp met de tekst erin.";
        (name ? form.querySelector("textarea") : form.querySelector("input")).focus();
        return;
      }
      const text = "Hoi Jungle Bar, ik ben " + name + ". Onderwerp: " + topic + ". " + message;
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      if (note) note.textContent = "WhatsApp is geopend met je bericht. Verstuur het daar om te reageren.";
    });
  }

  /* ---------------------------------------------------------- year stamp */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
