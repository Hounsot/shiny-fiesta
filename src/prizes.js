import "./style.css";
import { updateDisplays, injectResetButton } from "./balance.js";

/* ─── Segmented control ─── */

const tabBtns = document.querySelectorAll('[data-js="tab-btn"]');
const tabBg = document.querySelector('[data-js="tab-bg"]');
const tabAvailable = document.querySelector('[data-js="tab-available"]');
const tabWon = document.querySelector('[data-js="tab-won"]');

function getWonPrizes() {
  try { return JSON.parse(localStorage.getItem("wonPrizes") || "[]"); }
  catch { return []; }
}

function renderWonPrizes() {
  const container = document.querySelector('[data-js="won-list"]');
  const emptyMsg = document.querySelector('[data-js="won-empty"]');
  const list = getWonPrizes();
  container.innerHTML = "";

  if (list.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }

  emptyMsg.classList.add("hidden");
  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "prize-card w-[calc(50%-4px)] min-h-[148px] bg-[#F2F3F7] rounded-[20px] p-[16px] flex flex-col justify-between relative overflow-hidden";
    card.innerHTML = `
      <p class="p4-medium-comp leading-[18px]">${p.label}</p>
      <div class="flex justify-end items-end">
        <img class="w-[64px] h-[64px] object-contain" src="${p.image}" alt="">
      </div>`;
    container.appendChild(card);
  });
}

function switchTab(tab) {
  if (tab === "available") {
    tabBg.style.left = "4px";
    tabAvailable.classList.remove("hidden");
    tabAvailable.style.display = "flex";
    tabWon.classList.add("hidden");
    tabWon.style.display = "";
  } else {
    tabBg.style.left = "calc(50%)";
    tabAvailable.classList.add("hidden");
    tabAvailable.style.display = "";
    tabWon.classList.remove("hidden");
    tabWon.style.display = "flex";
    renderWonPrizes();
  }
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

/* ─── Init ─── */

updateDisplays();
injectResetButton();
