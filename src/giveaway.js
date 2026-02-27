import "./style.css";
import {
  getCashback,
  setCashback,
  getStars,
  setStars,
  getPlaces,
  setPlaces,
  updateDisplays,
  GIVEAWAYS,
  startTimers,
  injectResetButton,
} from "./balance.js";

const giveawayId = document.body.dataset.giveaway;
const giveaway = GIVEAWAYS[giveawayId];
if (!giveaway) throw new Error(`Unknown giveaway: ${giveawayId}`);

const placesSection = document.querySelector('[data-js="places-section"]');
const placesCount = document.querySelector('[data-js="places-count"]');
const warningStars = document.querySelector('[data-js="warning-stars"]');
const warningStarsText = document.querySelector('[data-js="warning-stars-text"]');
const buyPlaceBtn = document.querySelector('[data-js="buy-place-btn"]');
const buyStarsBtn = document.querySelector('[data-js="buy-stars-btn"]');
const placeCostLabel = document.querySelector('[data-js="place-cost"]');

function render() {
  updateDisplays();

  const currentStars = getStars();
  const places = getPlaces(giveawayId);
  const cost = giveaway.cost;
  const deficit = cost - currentStars;

  if (placesSection) {
    placesSection.style.display = places > 0 ? "" : "none";
  }
  if (placesCount) {
    placesCount.textContent = places;
  }
  if (placeCostLabel) {
    placeCostLabel.textContent = cost;
  }

  const enoughStars = currentStars >= cost;

  if (warningStars) {
    warningStars.style.display = enoughStars ? "none" : "flex";
  }
  if (warningStarsText) {
    warningStarsText.textContent = `Не хватает ${deficit} звезд для покупки места`;
  }
  if (buyPlaceBtn) {
    buyPlaceBtn.style.display = enoughStars ? "flex" : "none";
  }
  if (buyStarsBtn) {
    buyStarsBtn.style.display = enoughStars ? "none" : "flex";
  }
}

if (buyPlaceBtn) {
  buyPlaceBtn.addEventListener("click", () => {
    const currentStars = getStars();
    if (currentStars < giveaway.cost) return;
    setStars(currentStars - giveaway.cost);
    setPlaces(giveawayId, getPlaces(giveawayId) + 1);
    render();
  });
}

if (buyStarsBtn) {
  buyStarsBtn.addEventListener("click", () => {
    const cb = getCashback();
    if (cb < 100) return;
    setCashback(cb - 100);
    setStars(getStars() + 3);
    render();
  });
}

render();
startTimers();
injectResetButton();
