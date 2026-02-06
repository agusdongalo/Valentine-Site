import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const heartEmojis = ["<3", "<3", "<3", "<3", "<3"];

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
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const questionRef = useRef<HTMLDivElement | null>(null);

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
      heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      heart.style.left = `${event.clientX}px`;
      heart.style.top = `${event.clientY}px`;
      heart.style.fontSize = `${randomBetween(16, 28)}px`;
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 1200);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
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

  const moveNoButton = () => {
    const wrap = questionRef.current;
    const noBtn = wrap?.querySelector<HTMLButtonElement>(".secondary-button");
    if (!wrap) return;

    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const btnWidth = noBtn?.offsetWidth ?? 120;
    const btnHeight = noBtn?.offsetHeight ?? 44;
    const maxX = Math.max(0, width - btnWidth);
    const maxY = Math.max(0, height - btnHeight);

    setNoOffset({
      x: Math.floor(randomBetween(0, maxX)),
      y: Math.floor(randomBetween(0, maxY)),
    });
  };

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
            {"<3"}
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
        <div className="button-row">
          <button className="primary-button" onClick={() => setYesOpen(true)}>
            Yes
          </button>
          <button
            className="secondary-button"
            style={{ transform: `translate(${noOffset.x}px, ${noOffset.y}px)` }}
            onMouseEnter={moveNoButton}
            onFocus={moveNoButton}
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
