import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const loveNotes = [
  "You make my bad days better.",
  "Every moment with you feels like home.",
  "Your laugh is my favorite sound.",
  "You make ordinary days feel like magic.",
];

const memories = [
  { title: "First Adventure", note: "The day everything felt new and warm." },
  { title: "Laughs & Late Nights", note: "When time disappeared and we just talked." },
  { title: "Little Traditions", note: "Coffee, inside jokes, and tiny rituals." },
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function App() {
  const [yesOpen, setYesOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [yesOffset, setYesOffset] = useState({ x: 0, y: 20 });
  const [noOffset, setNoOffset] = useState({ x: 0, y: 20 });
  const lastCursor = useRef({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const questionRef = useRef<HTMLDivElement | null>(null);
  const buttonRowRef = useRef<HTMLDivElement | null>(null);

  const floatingHearts = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: randomBetween(2, 98),
        size: randomBetween(18, 38),
        delay: randomBetween(0, 8),
        duration: randomBetween(9, 16),
        opacity: randomBetween(0.35, 0.8),
      })),
    []
  );

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const heart = document.createElement("span");
      heart.className = "pop-heart";
      heart.textContent = "💗";
      heart.style.left = `${event.clientX}px`;
      heart.style.top = `${event.clientY}px`;
      heart.style.fontSize = `${randomBetween(16, 28)}px`;
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 1200);
    };

    const handleMove = (event: MouseEvent) => {
      lastCursor.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioOn) {
      audio.pause();
      setAudioOn(false);
      return;
    }

    try {
      await audio.play();
      setAudioOn(true);
      setAudioError(false);
    } catch {
      setAudioError(true);
    }
  };

  const moveNoButton = (cursorX?: number, cursorY?: number) => {
    const wrap = buttonRowRef.current;
    const noBtn = wrap?.querySelector<HTMLButtonElement>(".secondary-button");
    const yesBtn = wrap?.querySelector<HTMLButtonElement>(".primary-button");
    if (!wrap || !noBtn || !yesBtn) return;

    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    const padding = 8;
    const maxX = Math.max(padding, width - btnWidth - padding);
    const maxY = Math.max(padding, height - btnHeight - padding);
    const maxPossible = Math.hypot(maxX - padding, maxY - padding);
    const minDodge = Math.min(160, Math.max(80, maxPossible * 0.6));
    const minCursorDistance = 140;
    const cursor = {
      x: cursorX ?? lastCursor.current.x,
      y: cursorY ?? lastCursor.current.y,
    };

    let nextX = noOffset.x;
    let nextY = noOffset.y;

    const yesRect = {
      left: yesOffset.x,
      right: yesOffset.x + yesBtn.offsetWidth,
      top: yesOffset.y,
      bottom: yesOffset.y + yesBtn.offsetHeight,
    };

    let fallbackX = nextX;
    let fallbackY = nextY;
    let bestDistance = 0;

    for (let attempt = 0; attempt < 24; attempt += 1) {
      const candidateX = Math.floor(randomBetween(padding, maxX));
      const candidateY = Math.floor(randomBetween(padding, maxY));
      const distance = Math.hypot(candidateX - noOffset.x, candidateY - noOffset.y);
      const cursorDistance = Math.hypot(
        candidateX + btnWidth / 2 - cursor.x,
        candidateY + btnHeight / 2 - cursor.y
      );

      const overlapsYes = !(
        candidateX + btnWidth < yesRect.left - 12 ||
        candidateX > yesRect.right + 12 ||
        candidateY + btnHeight < yesRect.top - 12 ||
        candidateY > yesRect.bottom + 12
      );

      if (!overlapsYes && cursorDistance >= minCursorDistance && distance > bestDistance) {
        bestDistance = distance;
        fallbackX = candidateX;
        fallbackY = candidateY;
      }

      if (distance >= minDodge && !overlapsYes && cursorDistance >= minCursorDistance) {
        nextX = candidateX;
        nextY = candidateY;
        break;
      }
    }

    if (nextX === noOffset.x && nextY === noOffset.y) {
      nextX = fallbackX;
      nextY = fallbackY;
    }

    setNoOffset({ x: nextX, y: nextY });
  };

  useEffect(() => {
    const wrap = buttonRowRef.current;
    const noBtn = wrap?.querySelector<HTMLButtonElement>(".secondary-button");
    const yesBtn = wrap?.querySelector<HTMLButtonElement>(".primary-button");
    if (!wrap || !noBtn || !yesBtn) return;

    const wrapWidth = wrap.clientWidth;
    const gap = 16;
    const rowWidth = wrap.clientWidth;
    const totalWidth = yesBtn.offsetWidth + gap + noBtn.offsetWidth;
    const yesX = Math.max(0, (rowWidth - totalWidth) / 2);
    const noX = yesX + yesBtn.offsetWidth + gap;
    const y = Math.max(0, (wrap.clientHeight - yesBtn.offsetHeight) / 2);

    setYesOffset({ x: Math.floor(yesX), y: Math.floor(y) });
    setNoOffset({ x: Math.floor(noX), y: Math.floor(y) });
  }, []);

  return (
    <div className="page">
      <div className="sparkle-layer" />
      <div className="floating-hearts">
        {floatingHearts.map((heart) => (
          <span
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              opacity: heart.opacity,
            }}
          >
            💗
          </span>
        ))}
      </div>

      <header className="hero">
        <div className="hero-heart" aria-hidden="true" />
        <p className="love-note">Forever, yours</p>
        <h1>Will you be my Valentine?</h1>
        <p className="intro">
          I couldn't fit all my feelings into words... so I made this instead.
        </p>
        <button className="ghost-button" onClick={toggleAudio}>
          {audioOn ? "Pause our song" : "Play our song"}
        </button>
        {audioError && (
          <p className="helper">
            Add your song as <span>public/love-song.mp3</span> to enable playback.
          </p>
        )}
        <audio ref={audioRef} src="/love-song.mp3" preload="none" />
      </header>

      <section className="section">
        <h2>Why You're Special</h2>
        <div className="notes">
          {loveNotes.map((note) => (
            <article key={note} className="note-card">
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Memory Lane</h2>
        <div className="memories">
          {memories.map((memory) => (
            <article key={memory.title} className="memory-card">
              <div className="memory-photo">Add a photo here</div>
              <h3>{memory.title}</h3>
              <p>{memory.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section question" ref={questionRef}>
        <h2>The Question</h2>
        <p className="question-text">So... will you be my Valentine?</p>
        <div className="button-row" ref={buttonRowRef}>
          <button
            className="primary-button"
            style={{ left: `${yesOffset.x}px`, top: `${yesOffset.y}px` }}
            onClick={() => setYesOpen(true)}
          >
            Yes
          </button>
          <button
            className="secondary-button"
            style={{ left: `${noOffset.x}px`, top: `${noOffset.y}px` }}
            onMouseEnter={(event) => moveNoButton(event.clientX, event.clientY)}
            onMouseMove={(event) => moveNoButton(event.clientX, event.clientY)}
            onFocus={() => moveNoButton()}
          >
            No
          </button>
        </div>
      </section>

      <footer className="footer">Made with all my heart.</footer>

      {yesOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>You just made me the happiest person</h2>
            <p>
              Thank you for saying yes. I promise to keep choosing you, every day.
            </p>
            <button className="primary-button" onClick={() => setYesOpen(false)}>
              Keep smiling
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
