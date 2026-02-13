import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

interface Balloon {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  color: string;
}

interface FloatingMessage {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface PopBurst {
  id: number;
  x: number;
  y: number;
}

const BALLOON_COUNT = 15;

const LOVE_MESSAGES = [
  "I love you 💖",
  "I miss you 🥺",
  "You are my forever 💞",
  "You are too sweet 🍭",
  "My cutie 🐻",
  "My panda 🐼",
  "My sunshine ☀️",
  "Forever us 💕",
  "My heartbeat 💓",
  "My world 🌍",
];

const PASTEL_COLORS = [
  "linear-gradient(160deg, rgba(255,196,230,0.95), rgba(255,145,204,0.9))",
  "linear-gradient(160deg, rgba(255,215,230,0.95), rgba(255,170,210,0.9))",
  "linear-gradient(160deg, rgba(255,228,196,0.95), rgba(255,178,178,0.9))",
  "linear-gradient(160deg, rgba(220,200,255,0.95), rgba(192,160,255,0.9))",
  "linear-gradient(160deg, rgba(255,210,240,0.95), rgba(255,160,220,0.9))",
  "linear-gradient(160deg, rgba(255,236,210,0.95), rgba(255,200,150,0.9))",
  "linear-gradient(160deg, rgba(210,245,255,0.95), rgba(160,220,255,0.9))",
  "linear-gradient(160deg, rgba(230,255,230,0.95), rgba(180,255,180,0.9))",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createBalloon(id: number): Balloon {
  return {
    id,
    left: 4 + Math.random() * 92,
    size: 46 + Math.random() * 26,
    duration: 10 + Math.random() * 6,
    delay: Math.random() * 2,
    sway: (8 + Math.random() * 20) * (Math.random() > 0.5 ? 1 : -1),
    color: randomItem(PASTEL_COLORS),
  };
}

export default function LoveBalloonGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutIdsRef = useRef<number[]>([]);
  const nextBalloonIdRef = useRef(1);
  const nextMessageIdRef = useRef(1);
  const nextBurstIdRef = useRef(1);

  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: BALLOON_COUNT }, () => createBalloon(nextBalloonIdRef.current++)),
  );
  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);
  const [popBursts, setPopBursts] = useState<PopBurst[]>([]);

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId);
      fn();
    }, delay);

    timeoutIdsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  const handleBalloonClick = useCallback(
    (balloonId: number, event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      const rect = containerRef.current?.getBoundingClientRect();
      const rawX = rect ? event.clientX - rect.left : event.clientX;
      const rawY = rect ? event.clientY - rect.top : event.clientY;
      const x = rect ? Math.max(24, Math.min(rawX, rect.width - 24)) : rawX;
      const y = rect ? Math.max(24, Math.min(rawY, rect.height - 24)) : rawY;

      const messageId = nextMessageIdRef.current++;
      const burstId = nextBurstIdRef.current++;

      setBalloons((prev) => prev.filter((balloon) => balloon.id !== balloonId));
      setFloatingMessages((prev) => [
        ...prev,
        {
          id: messageId,
          x,
          y,
          text: randomItem(LOVE_MESSAGES),
        },
      ]);
      setPopBursts((prev) => [...prev, { id: burstId, x, y }]);

      confetti({
        particleCount: 24,
        spread: 65,
        startVelocity: 24,
        scalar: 0.65,
        origin: {
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight,
        },
        colors: ["#ffb6c1", "#ff69b4", "#ff1493", "#ffd1dc", "#ffc7e8"],
      });

      scheduleTimeout(() => {
        setFloatingMessages((prev) => prev.filter((message) => message.id !== messageId));
      }, 1600);

      scheduleTimeout(() => {
        setPopBursts((prev) => prev.filter((burst) => burst.id !== burstId));
      }, 650);

      scheduleTimeout(() => {
        setBalloons((prev) => [...prev, createBalloon(nextBalloonIdRef.current++)]);
      }, 220);
    },
    [scheduleTimeout],
  );

  return (
    <div ref={containerRef} className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {balloons.map((balloon) => (
          <motion.button
            key={balloon.id}
            type="button"
            onClick={(event) => handleBalloonClick(balloon.id, event)}
            className="absolute bottom-0 pointer-events-auto focus:outline-none"
            style={{ left: `${balloon.left}%` }}
            initial={{ y: "115vh", opacity: 0, scale: 0.9 }}
            animate={{
              y: "-25vh",
              opacity: [0, 1, 1, 0],
              x: [0, balloon.sway, -balloon.sway, 0],
              scale: [0.95, 1, 1, 0.98],
            }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.22, ease: "easeOut" } }}
            transition={{
              duration: balloon.duration,
              delay: balloon.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="relative flex items-center justify-center">
              <div
                className="rounded-full shadow-[0_10px_30px_rgba(255,140,190,0.35)]"
                style={{
                  width: `${balloon.size}px`,
                  height: `${balloon.size * 1.26}px`,
                  background: balloon.color,
                }}
              />
              <div className="absolute inset-0 rounded-full shadow-[inset_-8px_-10px_16px_rgba(255,255,255,0.25)]" />
              <span className="absolute left-1/2 top-full h-10 w-px -translate-x-1/2 bg-white/70" />
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {popBursts.map((burst) => (
          <motion.div
            key={burst.id}
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
            style={{ left: burst.x, top: burst.y }}
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="h-7 w-7 rounded-full border border-white/70 bg-white/40 shadow-[0_0_20px_rgba(255,210,240,0.8)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {floatingMessages.map((message) => (
          <motion.div
            key={message.id}
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 text-sm md:text-base font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            style={{ left: message.x, top: message.y }}
            initial={{ opacity: 0, y: 0, scale: 0.95 }}
            animate={{ opacity: 1, y: -45, scale: 1 }}
            exit={{ opacity: 0, y: -70 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {message.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
