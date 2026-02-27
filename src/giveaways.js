import "./style.css";
import { getPlaces, updateDisplays, GIVEAWAYS, startTimers, injectResetButton } from "./balance.js";

const participatingList = document.querySelector('[data-js="participating-list"]');
const participatingSection = document.querySelector('[data-js="participating-section"]');
const allCards = document.querySelectorAll("[data-giveaway]");

function render() {
  updateDisplays();

  const participating = [];

  allCards.forEach((card) => {
    const id = card.dataset.giveaway;
    const places = getPlaces(id);
    const placesLabel = card.querySelector('[data-js="places-label"]');
    const actionLabel = card.querySelector('[data-js="action-label"]');

    if (places > 0) {
      if (placesLabel) {
        placesLabel.textContent = `Мест у вас: ${places}`;
        placesLabel.style.display = "";
      }
      if (actionLabel) {
        actionLabel.textContent = "улучшить шансы";
      }
      participating.push(card);
    } else {
      if (placesLabel) {
        placesLabel.style.display = "none";
      }
      if (actionLabel) {
        actionLabel.textContent = "Участвовать";
      }
    }
  });

  if (participatingList && participatingSection) {
    participatingList.innerHTML = "";
    if (participating.length > 0) {
      participatingSection.style.display = "";
      participating.forEach((card) => {
        participatingList.appendChild(card.cloneNode(true));
      });
    } else {
      participatingSection.style.display = "none";
    }
  }
}

render();
startTimers();
injectResetButton();
