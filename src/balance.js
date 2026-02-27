const DEFAULTS = { cashback: 3250, stars: 0 };

export const GIVEAWAYS = {
  iphone: { cost: 5, label: "IPhone 15 Pro Max", deadline: "2026-02-25T12:00:00" },
  airpods: { cost: 3, label: "Apple Airpods Max", deadline: "2026-02-22T12:00:00" },
  money: { cost: 2, label: "50 000 ₽", deadline: "2026-02-22T12:00:00" },
  steamdeck: { cost: 4, label: "Steam Deck OLED", deadline: "2026-03-05T12:00:00" },
  alisa: { cost: 1, label: "Яндекс Станция Миди", deadline: "2026-03-05T12:00:00" },
};

export function formatCountdown(deadline) {
  const diff = new Date(deadline) - Date.now();
  if (diff <= 0) return "00:00:00";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return d > 0 ? `${d}д ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function startTimers() {
  function tick() {
    document.querySelectorAll("[data-deadline]").forEach((el) => {
      el.textContent = formatCountdown(el.dataset.deadline);
    });
  }
  tick();
  setInterval(tick, 1000);
}

export function getCashback() {
  return Number(localStorage.getItem("balance_cashback") ?? DEFAULTS.cashback);
}

export function getStars() {
  return Number(localStorage.getItem("balance_stars") ?? DEFAULTS.stars);
}

export function setCashback(value) {
  localStorage.setItem("balance_cashback", value);
  updateDisplays();
}

export function setStars(value) {
  localStorage.setItem("balance_stars", value);
  updateDisplays();
}

export function getPlaces(giveawayId) {
  return Number(localStorage.getItem(`giveaway_places_${giveawayId}`) ?? 0);
}

export function setPlaces(giveawayId, count) {
  localStorage.setItem(`giveaway_places_${giveawayId}`, count);
}

export function resetAll() {
  localStorage.removeItem("balance_cashback");
  localStorage.removeItem("balance_stars");
  Object.keys(GIVEAWAYS).forEach((id) => {
    localStorage.removeItem(`giveaway_places_${id}`);
  });
  location.reload();
}

export function injectResetButton() {
  const btn = document.createElement("button");
  btn.textContent = "Reset";
  btn.style.cssText =
    "position:fixed;bottom:12px;right:12px;z-index:9999;padding:6px 14px;border-radius:10px;background:#ff3b30;color:#fff;font-size:12px;font-weight:700;border:none;cursor:pointer;opacity:0.7;font-family:system-ui";
  btn.addEventListener("click", resetAll);
  document.body.appendChild(btn);
}

export function updateDisplays() {
  document.querySelectorAll('[data-js="balance-cashback-value"]').forEach((el) => {
    el.textContent = getCashback();
  });
  document.querySelectorAll('[data-js="balance-stars-value"]').forEach((el) => {
    el.textContent = getStars();
  });
  document.querySelectorAll('[data-js="balance-star-value"]').forEach((el) => {
    el.textContent = getStars();
  });
}
