import "./style.css";
import { getCashback, setCashback, updateDisplays, injectResetButton } from "./balance.js";

/* ─── Prize pool ─── */

const PRIZES = [
  // Баллы Premium
  { type: "points", value: 15, image: "public/prizes/Cashback/15.png", label: "15 баллов Premium" },
  { type: "points", value: 30, image: "public/prizes/Cashback/30.png", label: "30 баллов Premium" },
  { type: "points", value: 60, image: "public/prizes/Cashback/60.png", label: "60 баллов Premium" },
  { type: "points", value: 150, image: "public/prizes/Cashback/150.png", label: "150 баллов Premium" },

  // Кешбэк категории
  { type: "cashback_category", value: 0, image: "public/prizes/Category/tickets.png", label: "15% на Авиабилеты", desc: "Автоматически применим на ваш счет" },
  { type: "cashback_category", value: 0, image: "public/prizes/Category/education.png", label: "10% на Образование", desc: "Автоматически применим на ваш счет" },
  { type: "cashback_category", value: 0, image: "public/prizes/Category/home.png", label: "10% на ЖКХ/ЖКУ", desc: "Автоматически применим на ваш счет" },

  // Билеты на розыгрыш
  { type: "ticket", value: 1, image: "public/prizes/Items/ticket1.png", label: "Билет на IPhone 17 Pro Max" },
  { type: "ticket", value: 3, image: "public/prizes/Items/ticket3.png", label: "3 Билета на IPhone 17 Pro Max" },
  { type: "ticket", value: 5, image: "public/prizes/Items/ticket5.png", label: "5 Билетов на IPhone 17 Pro Max" },

  // Партнёрские предложения
  { type: "partner", value: 0, image: "public/prizes/Category/cinema.png", label: "Level Travel", desc: "5% за оплату в категории Туры\n10% за оплату в категории Отели", tag: "До 13 апреля" },
  { type: "partner", value: 0, image: "public/prizes/Category/cinema.png", label: "Медси", desc: "6% за все последующие платежи по картам МТС Банка", tag: "До 13 апреля" },

  // Деньги внутри экосистемы МТС
  { type: "money", value: 30, image: "public/prizes/Cashback/mts.png", label: "30 ₽ на связь МТС", desc: "Начислим в конце месяца, если вы абонент МТС. Иначе — деньги на карту" },
  { type: "money", value: 50, image: "public/prizes/Cashback/cashbox.png", label: "50 ₽ на накопительный счет «Кешбокс»", desc: "Начислим в конце месяца, если у вас есть счет", secondBtn: "открыть кешбокс", secondBtnHref: "#" },
  { type: "money", value: 20, image: "public/prizes/Cashback/card.png", label: "20 ₽ на карту МТС Деньги", desc: "Начислим в конце месяца" },
];

function getWinScreenData(prize) {
  switch (prize.type) {
    case "points":
      return {
        title: `${prize.value} баллов Premium`,
        subtitle: "Зачислим в течение дня",
      };
    case "cashback_category":
      return {
        title: prize.label,
        subtitle: prize.desc,
        secondBtn: "подробнее о предложении",
        secondBtnHref: "#",
      };
    case "ticket":
      return {
        title: prize.label,
        subtitle: "Чем больше у вас билетов — тем выше шансы",
        secondBtn: "как работают билеты?",
        secondBtnHref: "#",
      };
    case "partner":
      return {
        title: prize.label,
        subtitle: prize.desc,
        tag: prize.tag,
        secondBtn: "к партнеру",
        secondBtnHref: "#",
      };
    case "money":
      return {
        title: prize.label,
        subtitle: prize.desc,
        secondBtn: prize.secondBtn,
        secondBtnHref: prize.secondBtnHref,
      };
    default:
      return { title: prize.label, subtitle: "" };
  }
}

/* ─── Balance ─── */

const SPIN_PRICE = 30;

function hasFreeSpin() {
  return !localStorage.getItem("free_spin_used");
}

function useFreeSpin() {
  localStorage.setItem("free_spin_used", "1");
}

function resetFreeSpinTimer() {
  localStorage.removeItem("free_spin_used");
  updateSpinButton();
}

window.__resetFreeSpinTimer = resetFreeSpinTimer;

/* ─── Carousel setup ─── */

const ACTIVE_SIZE = 200;
const INACTIVE_SIZE = 130;
const GAP = 12;
const STEP = ACTIVE_SIZE / 2 + GAP + INACTIVE_SIZE / 2;

const carousel = document.querySelector('[data-js="carousel"]');

function shuffleNoAdjacentSameType(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  for (let attempt = 0; attempt < 200; attempt++) {
    let conflict = -1;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].type === arr[i - 1].type) { conflict = i; break; }
    }
    if (conflict === -1) break;
    const swapWith = Math.floor(Math.random() * arr.length);
    if (swapWith !== conflict) {
      [arr[conflict], arr[swapWith]] = [arr[swapWith], arr[conflict]];
    }
  }
  return arr;
}

shuffleNoAdjacentSameType(PRIZES);

const JACKPOT_TYPES = ["points_150", "ticket_5"];
function isJackpot(prize) {
  return (prize.type === "points" && prize.value === 150) ||
         (prize.type === "ticket" && prize.value === 5);
}

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
const spinBtnLabel = document.querySelector('[data-js="spin-btn-label"]');
const spinBtnIcon = document.querySelector('[data-js="spin-btn-icon"]');
const gameControls = document.querySelector('[data-js="gama-controls"]');
const badgePrizes = document.querySelector('[data-js="badge-prizes"]');
const winControls = document.querySelector('[data-js="win-controls"]');
const playAgainBtn = document.querySelector('[data-js="play-again-button"]');
const pointer = document.querySelector('[data-js="pointer"]');
const prizeInfo = document.querySelector('[data-js="prize-info"]');
const prizeTitle = document.querySelector('[data-js="prize-title"]');
const prizeSubtitle = document.querySelector('[data-js="prize-subtitle"]');
const prizeTag = document.querySelector('[data-js="prize-tag"]');
const prizeTagText = document.querySelector('[data-js="prize-tag-text"]');
const secondActionBtn = document.querySelector('[data-js="second-action-button"]');
const secondActionLabel = document.querySelector('[data-js="second-action-label"]');
const nav = document.querySelector('[data-js="nav"]');
const smallRays = document.getElementById("small-rays");
const bigRays = document.getElementById("big-rays");

let activeIndex = 0;
let isSpinning = false;
let idleTimer = null;

/* ─── Carousel side items visibility ─── */

function hideSideItems() {
  items.forEach((item, i) => {
    if (i !== activeIndex) {
      item.style.transition = "opacity 0.3s ease-in-out";
      item.style.opacity = "0";
    }
  });
}

function restoreSideItems() {
  items.forEach((item) => {
    item.style.transition = "";
  });
}

/* ─── rays transition ─── */

function getRayAnimation(el) {
  const anims = el.getAnimations();
  return anims.length ? anims[0] : null;
}

function rampPlaybackRate(el, targetRate, durationMs) {
  const anim = getRayAnimation(el);
  if (!anim) return;
  const startRate = anim.playbackRate;
  const t0 = performance.now();
  function step(now) {
    const t = Math.min((now - t0) / durationMs, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    anim.playbackRate = startRate + (targetRate - startRate) * ease;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const RAYS_FAST_RATE = 30;

function animateRaysTransition() {
  rampPlaybackRate(smallRays, RAYS_FAST_RATE, 600);
  rampPlaybackRate(bigRays, RAYS_FAST_RATE, 600);

  bigRays.style.opacity = "1";

  setTimeout(() => {
    smallRays.style.opacity = "0";
  }, 200);

  setTimeout(() => {
    rampPlaybackRate(bigRays, 1, 1000);
  }, 800);
}

function resetRaysSpeed() {
  const a1 = getRayAnimation(smallRays);
  const a2 = getRayAnimation(bigRays);
  if (a1) a1.playbackRate = 1;
  if (a2) a2.playbackRate = 1;
}

/* ─── UI state ─── */

function showGameControls() {
  gameControls.style.transition = "opacity 0.3s ease-in-out";
  badgePrizes.style.transition = "opacity 0.3s ease-in-out";
  winControls.style.transition = "opacity 0.3s ease-in-out";
  gameControls.classList.remove("disappear");
  badgePrizes.classList.remove("disappear");
  winControls.classList.add("disappear");
  prizeInfo.classList.add("disappear");
  nav.classList.remove("disappear");
  resetRaysSpeed();
  smallRays.style.opacity = "1";
  bigRays.style.opacity = "0";
  restoreSideItems();
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
  const data = getWinScreenData(prize);

  gameControls.style.transition = "opacity 0.3s ease-in-out";
  badgePrizes.style.transition = "opacity 0.3s ease-in-out";
  winControls.style.transition = "opacity 0.3s ease-in-out";
  winControls.classList.remove("disappear");
  pointer.classList.add("disappear");

  prizeTitle.textContent = data.title;
  prizeSubtitle.textContent = data.subtitle;

  if (data.tag) {
    prizeTag.classList.remove("hidden");
    prizeTagText.textContent = data.tag;
  } else {
    prizeTag.classList.add("hidden");
  }

  prizeInfo.classList.remove("disappear");

  if (data.secondBtn) {
    secondActionBtn.classList.remove("hidden");
    secondActionBtn.style.display = "flex";
    secondActionLabel.textContent = data.secondBtn;
    secondActionBtn.href = data.secondBtnHref || "#";
  } else {
    secondActionBtn.classList.add("hidden");
    secondActionBtn.style.display = "";
  }

  nav.classList.remove("disappear");

  hideSideItems();

  animateRaysTransition();
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
  if (prize.type === "points") {
    setCashback(getCashback() + prize.value);
  }
  saveWonPrize(prize);
}

function saveWonPrize(prize) {
  const list = getWonPrizes();
  list.push({ image: prize.image, label: prize.label, type: prize.type, value: prize.value });
  localStorage.setItem("wonPrizes", JSON.stringify(list));
}

function getWonPrizes() {
  try { return JSON.parse(localStorage.getItem("wonPrizes") || "[]"); }
  catch { return []; }
}

function spin() {
  if (isSpinning) return;

  const free = hasFreeSpin();
  if (!free && getCashback() < SPIN_PRICE) return;

  isSpinning = true;
  if (free) {
    useFreeSpin();
  } else {
    setCashback(getCashback() - SPIN_PRICE);
  }
  stopIdle();
  hideGameControls();

  const targetIndex = Math.floor(Math.random() * count);

  const nextIndex = (targetIndex + 1) % count;
  if (!isJackpot(PRIZES[nextIndex])) {
    const jackpots = PRIZES.map((p, i) => i).filter((i) => isJackpot(PRIZES[i]) && i !== targetIndex);
    if (jackpots.length > 0) {
      const pick = jackpots[Math.floor(Math.random() * jackpots.length)];
      [PRIZES[nextIndex], PRIZES[pick]] = [PRIZES[pick], PRIZES[nextIndex]];
      const oldSrc = items[nextIndex].querySelector("img").src;
      items[nextIndex].querySelector("img").src = items[pick].querySelector("img").src;
      items[pick].querySelector("img").src = oldSrc;
      items[nextIndex].querySelector("img").alt = PRIZES[nextIndex].label;
      items[pick].querySelector("img").alt = PRIZES[pick].label;
    }
  }

  const fullRotations = 5 + Math.floor(Math.random() * 2);
  let dist = targetIndex - activeIndex;
  if (dist <= 0) dist += count;
  const totalDist = fullRotations * count + dist;

  const doOvershoot = Math.random() < 0.9;
  const overshootPx = doOvershoot ? (50 + Math.random() * 30) : 0;
  const overshootItems = overshootPx / STEP;

  const startPos = activeIndex;
  const spinDuration = 6200;
  const bounceDuration = doOvershoot ? 450 : 0;
  const totalDuration = spinDuration + bounceDuration;
  const t0 = performance.now();

  function tick(now) {
    const elapsed = now - t0;

    if (elapsed < spinDuration) {
      const t = elapsed / spinDuration;
      const pos = startPos + (totalDist + overshootItems) * spinEasing(t);
      renderContinuous(pos);
      requestAnimationFrame(tick);
    } else if (doOvershoot && elapsed < totalDuration) {
      const bt = (elapsed - spinDuration) / bounceDuration;
      const ease = bt < 0.5
        ? 4 * bt * bt * bt
        : 1 - Math.pow(-2 * bt + 2, 3) / 2;
      const pos = startPos + totalDist + overshootItems * (1 - ease);
      renderContinuous(pos);
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
  updateSpinButton();
  startIdle();
}

/* ─── Spin button state ─── */

function updateSpinButton() {
  if (hasFreeSpin()) {
    spinBtnLabel.textContent = "Крутить бесплатно";
    spinBtnIcon.classList.add("hidden");
  } else {
    spinBtnLabel.textContent = `Крутить за ${SPIN_PRICE}`;
    spinBtnIcon.classList.remove("hidden");
  }
}

/* ─── Init ─── */

updateDisplays();
updateSpinButton();
injectResetButton();
startIdle();
spinBtn.addEventListener("click", spin);
playAgainBtn.addEventListener("click", playAgain);
