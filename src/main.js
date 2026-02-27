import "./style.css";
import "./recent-wins.js";
import { getCashback, setCashback, getStars, setStars, updateDisplays, injectResetButton } from "./balance.js";

/* ─── Prize pool ─── */

const PRIZES = [
  { type: "cashback", value: 25, image: "public/prizes/Cashback/25.png", label: "25 баллов" },
  { type: "stars", value: 1, image: "public/prizes/Stars/star1.png", label: "1 звезда" },
  { type: "cashback", value: 100, image: "public/prizes/Cashback/100.png", label: "100 баллов" },
  { type: "category", value: 0, image: "public/prizes/Category/cinema.png", label: "Кино", desc: "Дополнительный кешбэк 20% на кино в марте" },
  { type: "cashback", value: 200, image: "public/prizes/Cashback/200.png", label: "200 баллов" },
  { type: "stars", value: 3, image: "public/prizes/Stars/star3.png", label: "3 звезды" },
  { type: "item", value: 0, image: "public/prizes/Items/iphone.png", label: "iPhone" },
  { type: "stars", value: 5, image: "public/prizes/Stars/star5.png", label: "5 звёзд" },
];

function getPrizeDescription(prize) {
  switch (prize.type) {
    case "stars":
      return "Звезда для участия в розыгрыше. Призы уже ждут тебя";
    case "cashback":
      return `${prize.value} баллов кешбэка`;
    case "item":
      return "Бесплатно закажите этот товар в МТС Shop";
    case "category":
      return prize.desc;
    default:
      return "";
  }
}

/* ─── Balance ─── */

let selectedPrice = 50;

/* ─── Carousel setup ─── */

const ACTIVE_SIZE = 200;
const INACTIVE_SIZE = 130;
const GAP = 12;
const STEP = ACTIVE_SIZE / 2 + GAP + INACTIVE_SIZE / 2;

const carousel = document.querySelector('[data-js="carousel"]');

function buildCarouselItems() {
  carousel.innerHTML = "";
  PRIZES.forEach((prize) => {
    const el = document.createElement("div");
    el.className = "carousel-item rounded-4xl overflow-hidden flex items-center justify-center";
    const img = document.createElement("img");
    img.src = prize.image;
    img.alt = prize.label;
    img.className = "w-full h-full object-contain";
    img.draggable = false;
    el.appendChild(img);
    carousel.appendChild(el);
  });
}

buildCarouselItems();

const items = carousel.querySelectorAll(".carousel-item");
const count = items.length;

/* ─── DOM refs ─── */

const spinBtn = document.querySelector('[data-js="gama-controls-button"]');
const priceLabel = document.querySelector('[data-js="gama-controls-button-price"]');
const priceBtns = document.querySelectorAll('[data-js="price-btn"]');
const gameControls = document.querySelector('[data-js="gama-controls"]');
const badgePrizes = document.querySelector('[data-js="badge-prizes"]');
const winControls = document.querySelector('[data-js="win-controls"]');
const playAgainBtn = document.querySelector('[data-js="play-again-button"]');
const pointer = document.querySelector('[data-js="pointer"]');
const prizeDescription = document.querySelector('[data-js="prize-description"]');
const toRafflesBtn = document.querySelector('[data-js="to-raffles-button"]');
const toRafflesLabel = document.querySelector('[data-js="to-raffles-label"]');
const nav = document.querySelector('[data-js="nav"]');
const smallRays = document.getElementById("small-rays");
const bigRays = document.getElementById("big-rays");

let activeIndex = 0;
let isSpinning = false;
let idleTimer = null;

/* ─── UI state ─── */

function showGameControls() {
  gameControls.style.transition = "opacity 0.3s ease-in-out";
  badgePrizes.style.transition = "opacity 0.3s ease-in-out";
  winControls.style.transition = "opacity 0.3s ease-in-out";
  gameControls.classList.remove("disappear");
  badgePrizes.classList.remove("disappear");
  winControls.classList.add("disappear");
  prizeDescription.classList.add("disappear");
  nav.classList.remove("disappear");
  smallRays.style.opacity = "1";
  bigRays.style.opacity = "0";
}

function hideGameControls() {
  gameControls.style.transition = "opacity 0.3s ease-in-out";
  winControls.style.transition = "opacity 0.3s ease-in-out";
  gameControls.classList.add("disappear");
  badgePrizes.classList.add("disappear");
  nav.classList.add("disappear");
  pointer.classList.remove("disappear");
}

function showWinControls(prize) {
  gameControls.style.transition = "opacity 0.3s ease-in-out";
  badgePrizes.style.transition = "opacity 0.3s ease-in-out";
  winControls.style.transition = "opacity 0.3s ease-in-out";
  winControls.classList.remove("disappear");
  pointer.classList.add("disappear");
  prizeDescription.textContent = getPrizeDescription(prize);
  prizeDescription.classList.remove("disappear");

  if (prize.type === "item") {
    toRafflesLabel.textContent = "в МТС Shop";
    toRafflesBtn.href = "#";
  } else {
    toRafflesLabel.textContent = "к розыгрышам";
    toRafflesBtn.href = "/giveaways.html";
  }

  smallRays.style.opacity = "0";
  bigRays.style.opacity = "1";
}

/* ─── Idle: step-by-step with CSS transitions ─── */

function stepOffset(itemIdx, centerIdx) {
  let off = itemIdx - centerIdx;
  const half = Math.floor(count / 2);
  if (off > half) off -= count;
  if (off < -half) off += count;
  return off;
}

function applyStep(item, offset) {
  const isCenter = offset === 0;
  const size = isCenter ? ACTIVE_SIZE : INACTIVE_SIZE;
  item.style.width = `${size}px`;
  item.style.height = `${size}px`;
  item.style.transform = `translate(calc(-50% + ${offset * STEP}px), -50%)`;
  item.style.zIndex = isCenter ? 2 : 1;
  item.style.opacity = Math.abs(offset) > 1 ? 0 : 1;
}

function renderIdle(prevIdx) {
  items.forEach((item, i) => {
    item.style.transition = "";
    const off = stepOffset(i, activeIndex);

    if (prevIdx !== undefined) {
      const prev = stepOffset(i, prevIdx);
      if (Math.abs(off - prev) > 1) {
        item.style.transition = "none";
        applyStep(item, off > 0 ? off + 1 : off - 1);
        item.offsetHeight;
        item.style.transition = "";
      }
    }

    applyStep(item, off);
  });
}

function idleAdvance() {
  const prev = activeIndex;
  activeIndex = (activeIndex + 1) % count;
  renderIdle(prev);
}

function startIdle() {
  renderIdle();
  idleTimer = setInterval(idleAdvance, 2000);
}

function stopIdle() {
  clearInterval(idleTimer);
  idleTimer = null;
}

/* ─── Spin: continuous roulette via rAF ─── */

function continuousOffset(itemIdx, pos) {
  const norm = ((pos % count) + count) % count;
  let off = itemIdx - norm;
  if (off > count / 2) off -= count;
  if (off < -count / 2) off += count;
  return off;
}

function sizeAt(offset) {
  const t = Math.min(Math.abs(offset), 1);
  return ACTIVE_SIZE + (INACTIVE_SIZE - ACTIVE_SIZE) * t;
}

function renderContinuous(pos) {
  items.forEach((item, i) => {
    const off = continuousOffset(i, pos);
    const size = sizeAt(off);
    item.style.transition = "none";
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;
    item.style.transform = `translate(calc(-50% + ${off * STEP}px), -50%)`;
    item.style.zIndex = Math.round(100 - Math.abs(off) * 10);
    item.style.opacity = Math.abs(off) > 1.5 ? 0 : 1;
  });
}

function spinEasing(t) {
  if (t < 0.15) {
    const p = t / 0.15;
    return 0.08 * p * p;
  }
  const p = (t - 0.15) / 0.85;
  return 0.08 + 0.92 * (1 - Math.pow(1 - p, 4));
}

function awardPrize(prize) {
  if (prize.type === "cashback") {
    setCashback(getCashback() + prize.value);
  } else if (prize.type === "stars") {
    setStars(getStars() + prize.value);
  }
  saveWonPrize(prize);
}

function spin() {
  if (isSpinning) return;
  if (getCashback() < selectedPrice) return;

  isSpinning = true;
  setCashback(getCashback() - selectedPrice);
  stopIdle();
  hideGameControls();

  const targetIndex = Math.floor(Math.random() * count);
  const fullRotations = 5 + Math.floor(Math.random() * 2);
  let dist = targetIndex - activeIndex;
  if (dist <= 0) dist += count;
  const totalDist = fullRotations * count + dist;

  const startPos = activeIndex;
  const duration = 8000;
  const t0 = performance.now();

  function tick(now) {
    const t = Math.min((now - t0) / duration, 1);
    renderContinuous(startPos + totalDist * spinEasing(t));

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      activeIndex = targetIndex;
      isSpinning = false;
      renderIdle();
      const wonPrize = PRIZES[targetIndex];
      awardPrize(wonPrize);
      showWinControls(wonPrize);
    }
  }

  requestAnimationFrame(tick);
}

/* ─── Play again ─── */

function playAgain() {
  showGameControls();
  startIdle();
}

/* ─── Grade selection ─── */

const GRADES = {
  50: { accent: "#64aaca", shadow: "#8dd1ff", linktodocs: "#0070E5" },
  100: { accent: "#6564ca", shadow: "#c48dff", linktodocs: "#45b6fc" },
  500: { accent: "#a364ca", shadow: "#ff8df2", linktodocs: "#45b6fc" },
};

function selectGrade(price) {
  const grade = GRADES[price];
  if (!grade) return;

  selectedPrice = price;
  document.documentElement.style.setProperty("--accent", grade.accent);
  document.documentElement.style.setProperty("--shadow", grade.shadow);
  document.documentElement.style.setProperty("--linktodocs", grade.linktodocs);

  priceBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.price === String(price));
  });

  priceLabel.textContent = price;
}

/* ─── Won prizes ─── */

function getWonPrizes() {
  try { return JSON.parse(localStorage.getItem("wonPrizes") || "[]"); }
  catch { return []; }
}

function saveWonPrize(prize) {
  const list = getWonPrizes();
  list.push({ image: prize.image, label: prize.label, type: prize.type, value: prize.value });
  localStorage.setItem("wonPrizes", JSON.stringify(list));
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
    card.className = "w-[156px] h-[136px] lowerbg rounded-[20px] px-[16px] py-[8px] flex flex-col justify-between items-center";
    card.innerHTML = `<img class="w-[80px] h-[80px] object-contain" src="${p.image}" alt=""><p class="c1-medium-comp leading-[14px] text-center">${p.label}</p>`;
    container.appendChild(card);
  });
}

/* ─── Segmented control ─── */

const tabBtns = document.querySelectorAll('[data-js="tab-btn"]');
const tabBg = document.querySelector('[data-js="tab-bg"]');
const tabAvailable = document.querySelector('[data-js="tab-available"]');
const tabWon = document.querySelector('[data-js="tab-won"]');

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

/* ─── Prizes modal ─── */

const overlay = document.querySelector('[data-js="overlay"]');
const prizesModal = document.querySelector('[data-js="prizes-modal"]');
const closeModalBtn = document.querySelector('[data-js="close-modal"]');

function openPrizesModal() {
  switchTab("available");
  overlay.classList.remove("hidden");
  prizesModal.style.top = "52px";
}

function closePrizesModal() {
  prizesModal.style.top = "100%";
  overlay.classList.add("hidden");
}

badgePrizes.addEventListener("click", openPrizesModal);
overlay.addEventListener("click", closePrizesModal);
closeModalBtn.addEventListener("click", closePrizesModal);

/* ─── Init ─── */

selectGrade(50);
updateDisplays();
injectResetButton();
startIdle();
spinBtn.addEventListener("click", spin);
playAgainBtn.addEventListener("click", playAgain);
priceBtns.forEach((btn) => {
  btn.addEventListener("click", () => selectGrade(Number(btn.dataset.price)));
});
