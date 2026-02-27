const container = document.querySelector('[data-js="recent-wins"]');
const wins = container.children;

let current = 0;

function show(index) {
  for (let i = 0; i < wins.length; i++) {
    const el = wins[i];
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    if (i === index) {
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      el.style.transform = "translateX(0)";
    } else {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      el.style.transform = "translateX(-10px)";
    }
  }
}

show(current);

setInterval(() => {
  current = (current + 1) % wins.length;
  show(current);
}, 3000);
