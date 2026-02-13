import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Balloon {
  id: number;
  leftPx: number;
  duration: number;
  drift: number;
}

interface PopEffect {
  id: number;
  x: number;
  y: number;
  text: string;
}

const MIN_SPAWN_INTERVAL_MS = 1200;
const MAX_SPAWN_INTERVAL_MS = 2500;
const MAX_BALLOONS = 10;
const MIN_BALLOON_DISTANCE_PX = 80;

const messages = [
  "I love you more than pizza 🍕💖",
  "You are my forever person 💍✨",
  "My heart belongs to you 💕",
  "You make my world brighter 🌎💫",
  "I miss you every second 🥺",
  "You are too cute 😚",
  "Forever & always 💞",
  "My sunshine ☀️💖",
  "You stole my heart 😏💘",
  "I choose you every day ❤️",
  "My happy place is you 🏡💓",
  "You are magic ✨",
  "I’m lucky to have you 🍀💖",
];

const popSound = new Audio("/pop.mp3");

function randomMessage(): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function BalloonGame() {
  const nextBalloonIdRef = useRef(1);
  const spawnTimeoutIdRef = useRef<number | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [popped, setPopped] = useState<PopEffect[]>([]);
  const [poppingBalloons, setPoppingBalloons] = useState<number[]>([]);

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId);
      fn();
    }, delay);
    timeoutIdsRef.current.push(timeoutId);
  }, []);

  const createBalloon = useCallback((existing: Balloon[]): Balloon => {
    const viewportWidth = Math.max(window.innerWidth || 0, 320);
    let leftValue = Math.random() * viewportWidth;
    let attempts = 0;

    while (
      attempts < 24 &&
      existing.some((balloon) => Math.abs(balloon.leftPx - leftValue) < MIN_BALLOON_DISTANCE_PX)
    ) {
      leftValue = Math.random() * viewportWidth;
      attempts += 1;
    }

    return {
      id: nextBalloonIdRef.current++,
      leftPx: leftValue,
      duration: 8 + Math.random() * 4,
      drift: -40 + Math.random() * 80,
    };
  }, []);

  const removeBalloon = useCallback((balloonId: number) => {
    setBalloons((prev) => prev.filter((balloon) => balloon.id !== balloonId));
  }, []);

  const popBalloon = useCallback(
    (id: number, x: number, y: number) => {
      if (poppingBalloons.includes(id)) return;

      setPoppingBalloons((prev) => [...prev, id]);

      popSound.currentTime = 0;
      void popSound.play().catch(() => undefined);

      const text = randomMessage();
      const popupId = Date.now() + Math.floor(Math.random() * 100000);

      setPopped((prev) => [...prev, { id: popupId, text, x, y }]);

      scheduleTimeout(() => {
        setBalloons((prev) => prev.filter((balloon) => balloon.id !== id));
        setPoppingBalloons((prev) => prev.filter((balloonId) => balloonId !== id));
      }, 180);

      scheduleTimeout(() => {
        setPopped((prev) => prev.filter((item) => item.id !== popupId));
      }, 1200);
    },
    [poppingBalloons, scheduleTimeout],
  );

  useEffect(() => {
    setBalloons((prev) => (prev.length ? prev : [createBalloon(prev)]));
    const scheduleSpawn = () => {
      const delay =
        MIN_SPAWN_INTERVAL_MS +
        Math.floor(Math.random() * (MAX_SPAWN_INTERVAL_MS - MIN_SPAWN_INTERVAL_MS + 1));

      spawnTimeoutIdRef.current = window.setTimeout(() => {
        setBalloons((prev) => {
          if (prev.length >= MAX_BALLOONS) return prev;
          return [...prev, createBalloon(prev)];
        });
        scheduleSpawn();
      }, delay);
    };

    scheduleSpawn();

    return () => {
      if (spawnTimeoutIdRef.current) {
        clearTimeout(spawnTimeoutIdRef.current);
        spawnTimeoutIdRef.current = null;
      }
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [createBalloon]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-pink-700 font-semibold text-lg drop-shadow-lg"
        >
          🎈 Tap the balloons to see surprises 🎁
        </motion.p>
      </div>

      <AnimatePresence>
        {balloons.map((balloon) => (
          <motion.button
            key={balloon.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              popBalloon(balloon.id, e.clientX, e.clientY);
            }}
            onAnimationComplete={() => removeBalloon(balloon.id)}
            className="absolute z-[9999] pointer-events-auto cursor-pointer w-20 h-28 rounded-full bg-gradient-to-b from-pink-400 to-rose-500 shadow-[0_0_30px_rgba(255,0,120,0.6)]"
            style={{ left: balloon.leftPx, top: "110vh", pointerEvents: "auto" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              poppingBalloons.includes(balloon.id)
                ? {
                    scale: 0.18,
                    opacity: 0,
                  }
                : {
                    top: "-150px",
                    x: balloon.drift,
                    opacity: [0, 1, 1, 0.9, 0],
                    scale: [0.9, 1, 1, 0.95],
                  }
            }
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
            transition={
              poppingBalloons.includes(balloon.id)
                ? { duration: 0.16, ease: "easeIn" }
                : {
                    duration: balloon.duration,
                    ease: "linear",
                  }
            }
          >
            <span className="absolute inset-0 rounded-full shadow-[inset_-10px_-14px_16px_rgba(255,255,255,0.2)]" />
            <span className="absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-white/80" />
          </motion.button>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {popped.map((effect) => (
          <div
            key={effect.id}
            className="absolute z-[10000] pointer-events-none"
            style={{ left: effect.x, top: effect.y }}
          >
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.35, 0.85], y: -26 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="relative h-14 w-14">
                {[
                  { left: "50%", top: "0%", x: 0, y: -16 },
                  { left: "100%", top: "45%", x: 16, y: -6 },
                  { left: "75%", top: "95%", x: 10, y: 12 },
                  { left: "25%", top: "95%", x: -10, y: 12 },
                  { left: "0%", top: "45%", x: -16, y: -6 },
                ].map((sparkle, index) => (
                  <motion.span
                    key={index}
                    className="absolute text-pink-500"
                    style={{ left: sparkle.left, top: sparkle.top }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                    animate={{ x: sparkle.x, y: sparkle.y, opacity: [0, 1, 0], scale: [0.3, 1, 0.4] }}
                    transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.03 }}
                  >
                    ✨
                  </motion.span>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 text-pink-800 font-bold text-2xl whitespace-nowrap"
              initial={{ opacity: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], y: -40, scale: [0, 1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {effect.text}
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
