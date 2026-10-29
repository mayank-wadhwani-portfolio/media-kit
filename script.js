// Mayank Wadhwani website interactions.
// Replace placeholder gallery images and video paths with real media before publishing.
const WHATSAPP_NUMBER = "918949945003";
const BUSINESS_EMAIL = "business.mayankwadhwani@gmail.com";

document.getElementById("year").textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});
mainNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("menu-open");
}));

// Subtle reveal-on-scroll. Respect reduced motion and show content if IntersectionObserver is unavailable.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

// Lightweight fire/ember cursor. Disabled for touch and reduced-motion devices.
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (finePointer && !reducedMotion) {
  const glow = document.querySelector(".cursor-glow");
  const dot = document.querySelector(".cursor-dot");
  let lastTrail = 0;
  window.addEventListener("pointermove", event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
    const now = performance.now();
    if (now - lastTrail > 75) {
      lastTrail = now;
      const ember = document.createElement("span");
      ember.className = "ember";
      ember.style.left = `${event.clientX}px`;
      ember.style.top = `${event.clientY}px`;
      ember.style.setProperty("--drift", `${Math.round(Math.random() * 36 - 18)}px`);
      document.body.appendChild(ember);
      window.setTimeout(() => ember.remove(), 650);
    }
  }, { passive: true });
  document.addEventListener("pointerover", event => {
    if (event.target.closest("a,button,input,textarea,select")) {
      glow.style.width = "34px";
      glow.style.height = "34px";
      dot.textContent = "✹";
    }
  });
  document.addEventListener("pointerout", event => {
    if (event.target.closest("a,button,input,textarea,select")) {
      glow.style.width = "22px";
      glow.style.height = "22px";
      dot.textContent = "✦";
    }
  });
}

// Gallery filtering and lightbox
const galleryCards = [...document.querySelectorAll(".gallery-card")];
const filters = document.querySelectorAll(".filter-button");
filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(filter => filter.classList.toggle("active", filter === button));
  const category = button.dataset.filter;
  galleryCards.forEach(card => {
    card.hidden = category !== "all" && card.dataset.category !== category;
  });
}));

const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");
const closeLightbox = lightbox.querySelector(".lightbox-close");
let activeGalleryCards = [];
let activeGalleryIndex = 0;
function openLightbox(card) {
  activeGalleryCards = galleryCards.filter(item => !item.hidden);
  activeGalleryIndex = activeGalleryCards.indexOf(card);
  showLightboxImage();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeLightbox.focus();
}
function showLightboxImage() {
  const card = activeGalleryCards[activeGalleryIndex];
  if (!card) return;
  lightboxImage.src = card.dataset.image;
  lightboxImage.alt = card.querySelector("img")?.alt || "";
  lightboxCaption.textContent = card.dataset.caption || "";
}
function hideLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
galleryCards.forEach(card => card.addEventListener("click", () => openLightbox(card)));
closeLightbox.addEventListener("click", hideLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => {
  activeGalleryIndex = (activeGalleryIndex - 1 + activeGalleryCards.length) % activeGalleryCards.length;
  showLightboxImage();
});
lightbox.querySelector(".lightbox-next").addEventListener("click", () => {
  activeGalleryIndex = (activeGalleryIndex + 1) % activeGalleryCards.length;
  showLightboxImage();
});
lightbox.addEventListener("click", event => { if (event.target === lightbox) hideLightbox(); });
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") hideLightbox();
  if (event.key === "ArrowLeft") lightbox.querySelector(".lightbox-prev").click();
  if (event.key === "ArrowRight") lightbox.querySelector(".lightbox-next").click();
});

// Booking cards preselect the event type in the contact form.
document.querySelectorAll(".booking-card").forEach(card => card.addEventListener("click", () => {
  const select = document.querySelector('select[name="type"]');
  if (select && card.dataset.event) select.value = card.dataset.event;
}));

// Contact form creates a pre-filled WhatsApp enquiry; user reviews and sends it in WhatsApp.
const bookingForm = document.getElementById("booking-form");
bookingForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  const data = new FormData(bookingForm);
  const lines = [
    "Hi Mayank! I'd like to enquire about booking you for an event.",
    "",
    `Name: ${data.get("name")}`,
    `Event / Organisation: ${data.get("event")}`,
    `Event type: ${data.get("type")}`,
    `Event city: ${data.get("city") || "Not specified"}`,
    `Event date: ${data.get("date") || "Not specified"}`,
    `Email: ${data.get("email")}`,
    `Additional details: ${data.get("details") || "Not specified"}`
  ];
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  document.getElementById("form-status").textContent = "Opening WhatsApp with your enquiry. Review the message and press send there.";
  window.open(url, "_blank", "noopener,noreferrer");
});

// Hide the video placeholder overlay only when the actual media file is playable.
const video = document.querySelector(".video-screen video");
const videoScreen = document.querySelector(".video-screen");
video?.addEventListener("loadedmetadata", () => videoScreen.classList.add("has-video"));
video?.addEventListener("canplay", () => videoScreen.classList.add("has-video"));
video?.addEventListener("error", () => videoScreen.classList.remove("has-video"));
