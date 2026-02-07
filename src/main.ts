import "./styles.css";

const noBtn = document.getElementById("noBtn") as HTMLButtonElement;
const yesBtn = document.getElementById("yesBtn") as HTMLButtonElement;
const content = document.getElementById("content") as HTMLDivElement;
const success = document.getElementById("success") as HTMLDivElement;
const hero = document.getElementById("hero") as HTMLElement;
const floatingHearts = document.getElementById("floatingHearts") as HTMLDivElement;
const successHearts = document.getElementById("successHearts") as HTMLDivElement;
const fireworksVideo = document.getElementById("fireworksVideo") as HTMLVideoElement;
const fireworksCanvas = document.getElementById("fireworksCanvas") as HTMLCanvasElement;
const ctx = fireworksCanvas.getContext("2d");
const heartColors = ["#e95b83", "#ff7aa2", "#d94b6f", "#f2a3b7"];

let yesScale = 1;
const maxScale = 1.6;
const moveRadius = 120;

function spawnHearts(container: HTMLElement, count: number, className: string) {
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = className;
    heart.textContent = "\u2665";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 18}px`;
    heart.style.animationDuration = `${8 + Math.random() * 8}s`;
    heart.style.animationDelay = `${Math.random() * 6}s`;
    heart.style.opacity = `${0.3 + Math.random() * 0.5}`;
    heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
    container.appendChild(heart);
  }
}

spawnHearts(floatingHearts, 26, "heart");

function positionNoButton() {
  const yesRect = yesBtn.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const margin = 20;

  let x = yesRect.right + 20;
  let y = yesRect.top;

  const maxX = window.innerWidth - btnRect.width - margin;
  const maxY = window.innerHeight - btnRect.height - margin;

  x = Math.min(Math.max(margin, x), maxX);
  y = Math.min(Math.max(margin, y), maxY);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function applyYesGrowth() {
  yesScale = Math.min(maxScale, yesScale + 0.06);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.classList.remove("grow");
  void yesBtn.offsetWidth;
  yesBtn.classList.add("grow");
}

function moveNoButtonAway(cursorX: number, cursorY: number) {
  const btnRect = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const margin = 16;

  const angle = Math.atan2(btnRect.y - cursorY, btnRect.x - cursorX);
  let newX = btnRect.x + Math.cos(angle) * 140;
  let newY = btnRect.y + Math.sin(angle) * 140;

  const maxX = window.innerWidth - btnRect.width - margin;
  const maxY = window.innerHeight - btnRect.height - margin;

  newX = Math.min(Math.max(margin, newX), maxX);
  newY = Math.min(Math.max(margin, newY), maxY);

  const futureRect = {
    left: newX,
    right: newX + btnRect.width,
    top: newY,
    bottom: newY + btnRect.height,
  };

  const overlapsYes = !(
    futureRect.right < yesRect.left - 12 ||
    futureRect.left > yesRect.right + 12 ||
    futureRect.bottom < yesRect.top - 12 ||
    futureRect.top > yesRect.bottom + 12
  );

  if (overlapsYes) {
    newX = Math.min(Math.max(margin, yesRect.left - btnRect.width - 20), maxX);
    newY = Math.min(Math.max(margin, yesRect.top + 60), maxY);
  }

  noBtn.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${newX - btnRect.x}px, ${newY - btnRect.y}px)` },
    ],
    { duration: 180, easing: "ease-out", fill: "forwards" }
  );

  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;

  applyYesGrowth();
}

function checkProximity(x: number, y: number) {
  const rect = noBtn.getBoundingClientRect();
  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  const distance = Math.hypot(dx, dy);

  if (distance < moveRadius) {
    moveNoButtonAway(x, y);
  }
}

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
});

noBtn.addEventListener("focus", () => {
  const rect = noBtn.getBoundingClientRect();
  moveNoButtonAway(rect.left, rect.top);
});

noBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const rect = noBtn.getBoundingClientRect();
    moveNoButtonAway(rect.left, rect.top);
  }
});

document.addEventListener("mousemove", (event) => {
  checkProximity(event.clientX, event.clientY);
});

document.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (touch) {
    checkProximity(touch.clientX, touch.clientY);
  }
});

document.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (touch) {
    checkProximity(touch.clientX, touch.clientY);
  }
});

yesBtn.addEventListener("click", () => {
  content.classList.add("hide");
  success.classList.add("active");
  hero.style.background = "#000";
  spawnHearts(successHearts, 28, "success-heart");
  void fireworksVideo.play().catch(() => {});
  startPixelatedVideo();
});

function resizeCanvas() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}

function startPixelatedVideo() {
  const safeCtx = ctx;
  if (!safeCtx) return;

  resizeCanvas();
  const pixelSize = 10;
  const offscreen = document.createElement("canvas");
  const offscreenCtx = offscreen.getContext("2d");

  function draw(ctx2d: CanvasRenderingContext2D) {
    if (fireworksVideo.readyState >= 2 && offscreenCtx) {
      const w = fireworksCanvas.width;
      const h = fireworksCanvas.height;

      const scaledW = Math.ceil(w / pixelSize);
      const scaledH = Math.ceil(h / pixelSize);

      offscreen.width = scaledW;
      offscreen.height = scaledH;

      offscreenCtx.imageSmoothingEnabled = false;
      ctx2d.imageSmoothingEnabled = false;

      offscreenCtx.drawImage(fireworksVideo, 0, 0, scaledW, scaledH);
      ctx2d.drawImage(offscreen, 0, 0, scaledW, scaledH, 0, 0, w, h);
    }
    requestAnimationFrame(() => draw(ctx2d));
  }

  draw(safeCtx);
}

window.addEventListener("resize", () => {
  positionNoButton();
  resizeCanvas();
});

positionNoButton();
