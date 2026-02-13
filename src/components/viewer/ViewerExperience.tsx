import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useSwipeable } from "react-swipeable";

import BalloonGame from "@/components/animations/BalloonGame";
import { FloatingCuteStickers } from "@/components/animations/FloatingCuteStickers";
import { FloatingHearts } from "@/components/animations/FloatingHearts";
import SparkleOverlay from "@/components/animations/SparkleOverlay";
import { isThemeName, useTheme } from "@/contexts/ThemeContext";
import NotCreatedYet from "@/components/viewer/NotCreatedYet";
import ExpiredValentine from "@/components/viewer/ExpiredValentine";
import DeletedValentine from "@/components/viewer/DeletedValentine";
import TimelineSection, { type TimelineEntry } from "@/components/viewer/TimelineSection";

interface ImageData {
  url: string;
  caption?: string;
}

interface DurationParts {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HeartTrail {
  id: number;
  x: number;
  y: number;
}

const TIMER_PARTICLES = [
  { left: "14%", top: "22%", delay: 0 },
  { left: "78%", top: "28%", delay: 0.7 },
  { left: "28%", top: "74%", delay: 1.3 },
  { left: "84%", top: "68%", delay: 2 },
];

function calculateDuration(start: Date, end: Date): DurationParts {
  if (end.getTime() < start.getTime()) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

export default function ViewerExperience() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, setThemeName } = useTheme();
  const [status, setStatus] = useState<"loading" | "ok" | "not-created" | "deleted" | "expired">("loading");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [relationshipStartDate, setRelationshipStartDate] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationParts | null>(null);
  const [stage, setStage] = useState<"intro" | "question" | "celebration" | "memories">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isLiteMotion, setIsLiteMotion] = useState(false);
  const [hearts, setHearts] = useState<HeartTrail[]>([]);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const nextHeartIdRef = useRef(1);
  const heartThrottleRef = useRef(0);

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeoutId);
      fn();
    }, delay);

    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const updateMotionMode = () => {
      setIsLiteMotion(reducedMotionQuery.matches || coarsePointerQuery.matches);
    };

    updateMotionMode();

    const supportsEventListener = typeof reducedMotionQuery.addEventListener === "function";
    if (supportsEventListener) {
      reducedMotionQuery.addEventListener("change", updateMotionMode);
      coarsePointerQuery.addEventListener("change", updateMotionMode);
      return () => {
        reducedMotionQuery.removeEventListener("change", updateMotionMode);
        coarsePointerQuery.removeEventListener("change", updateMotionMode);
      };
    }

    reducedMotionQuery.addListener(updateMotionMode);
    coarsePointerQuery.addListener(updateMotionMode);
    return () => {
      reducedMotionQuery.removeListener(updateMotionMode);
      coarsePointerQuery.removeListener(updateMotionMode);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isLiteMotion) return;
      if (stage === "intro" || stage === "question") return;

      const now = Date.now();
      if (now - heartThrottleRef.current < 170) return;
      heartThrottleRef.current = now;

      const heartId = nextHeartIdRef.current++;
      const newHeart: HeartTrail = {
        id: heartId,
        x: e.clientX,
        y: e.clientY,
      };

      setHearts((prev) => [...prev.slice(-5), newHeart]);
      scheduleTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart.id !== heartId));
      }, 700);
    },
    [isLiteMotion, scheduleTimeout, stage],
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const resetViewState = () => {
      setStage("intro");
      setCurrentIndex(0);
      setShowSparkles(false);
    };

    async function fetchData() {
      setStatus("loading");
      setMessage("");
      setImages([]);
      setTimeline([]);
      setRelationshipStartDate(null);
      resetViewState();

      if (!id) {
        setStatus("not-created");
        return;
      }

      try {
        const ref = doc(db, "valentines", id);
        const snap = await getDoc(ref);

        if (cancelled) return;

        if (!snap.exists()) {
          setStatus("not-created");
          return;
        }

        const data = snap.data();

        if (data.isDeleted) {
          setStatus("deleted");
          return;
        }

        const expiresAt = data.expiresAt?.toDate?.();
        if (expiresAt && expiresAt < new Date()) {
          setStatus("expired");
          return;
        }

        if (!data.hasContent) {
          setStatus("not-created");
          return;
        }

        setMessage(data.personalMessage || "");
        setImages(data.images || []);
        if (Array.isArray(data.timeline)) {
          const parsedTimeline = data.timeline
            .filter(
              (entry): entry is TimelineEntry =>
                entry &&
                typeof entry.imageUrl === "string" &&
                typeof entry.date === "string" &&
                typeof entry.title === "string" &&
                typeof entry.description === "string",
            )
            .sort((a, b) => a.date.localeCompare(b.date));
          setTimeline(parsedTimeline);
        } else {
          setTimeline([]);
        }

        const rawDate = data.relationshipStartDate;
        let normalizedDate: string | null = null;
        if (typeof rawDate === "string") {
          normalizedDate = rawDate;
        } else if (rawDate?.toDate) {
          normalizedDate = rawDate.toDate().toISOString().slice(0, 10);
        }

        if (isThemeName(data.theme)) {
          setThemeName(data.theme);
        }

        setRelationshipStartDate(normalizedDate);
        setStatus("ok");
      } catch (err) {
        if (!cancelled) {
          setStatus("not-created");
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id, setThemeName]);

  useEffect(() => {
    if (!relationshipStartDate) {
      setDuration(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const startDate = new Date(`${relationshipStartDate}T00:00:00`);
    const tick = () => setDuration(calculateDuration(startDate, new Date()));

    tick();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [relationshipStartDate]);

  useEffect(() => {
    if (stage !== "celebration") return;

    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.4 },
      scalar: 0.9,
    });

    scheduleTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 120,
        angle: 60,
        origin: { x: 0.05, y: 0.5 },
        scalar: 0.8,
      });
    }, 250);

    scheduleTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 120,
        angle: 120,
        origin: { x: 0.95, y: 0.5 },
        scalar: 0.8,
      });
    }, 500);
  }, [stage, scheduleTimeout]);

  // Auto transition from celebration to memories after 5 seconds
  useEffect(() => {
    if (stage === "celebration") {
      scheduleTimeout(() => {
        setStage("memories");
        setShowSparkles(true);
        setCurrentIndex(0);
      }, 5000);
    }
  }, [stage, scheduleTimeout]);

  useEffect(() => {
    if (!images.length) return;
    if (currentIndex > images.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, images.length]);

  const goToNextSlide = useCallback(() => {
    if (!images.length) return;
    setSlideDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToPrevSlide = useCallback(() => {
    if (!images.length) return;
    setSlideDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    if (!images.length) return;
    const interval = window.setInterval(goToNextSlide, 4000);

    return () => clearInterval(interval);
  }, [goToNextSlide, images.length]);

  const handlers = useSwipeable({
    onSwipedLeft: goToNextSlide,
    onSwipedRight: goToPrevSlide,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleYes = () => {
    // Massive confetti burst
    confetti({
      particleCount: 300,
      spread: 180,
      origin: { y: 0.6 },
    });
    musicRef.current?.play();

    // Multiple bursts
    scheduleTimeout(() => {
      confetti({
        particleCount: 200,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
    }, 500);

    scheduleTimeout(() => {
      confetti({
        particleCount: 200,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 1000);

    setStage("celebration");
  };

  const handleNoHover = () => {
    if (noButtonRef.current && containerRef.current) {
      const button = noButtonRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      let newLeft = Math.random() * (containerRect.width - buttonRect.width);
      let newTop = Math.random() * (containerRect.height - buttonRect.height);

      // Ensure button stays within container
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - buttonRect.width));
      newTop = Math.max(0, Math.min(newTop, containerRect.height - buttonRect.height));

      button.style.position = "absolute";
      button.style.left = `${newLeft}px`;
      button.style.top = `${newTop}px`;
    }
  };

  const handleNoMove = () => {
    handleNoHover();
  };

  const handleCreateOwn = () => {
    navigate("/auth");
  };

  if (status === "loading") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.primaryText}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          💕
        </motion.div>
      </div>
    );
  }

  if (status === "not-created") {
    return <NotCreatedYet />;
  }

  if (status === "deleted") {
    return <DeletedValentine />;
  }

  if (status === "expired") {
    return <ExpiredValentine />;
  }

  return (
    <>
      {(stage === "celebration" || stage === "memories") && <BalloonGame />}
      <div
        className={`min-h-screen relative overflow-hidden overflow-x-hidden px-4 ${theme.background} ${theme.primaryText}`}
        onMouseMove={handleMouseMove}
      >
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className={`absolute -left-28 -top-28 h-[48vh] w-[48vh] rounded-full blur-3xl bg-gradient-to-r ${theme.accentGradient}`}
          animate={isLiteMotion ? { opacity: 0.12 } : { opacity: [0.1, 0.18, 0.1], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute -right-28 -bottom-28 h-[50vh] w-[50vh] rounded-full blur-3xl bg-gradient-to-r ${theme.accentGradient}`}
          animate={isLiteMotion ? { opacity: 0.08 } : { opacity: [0.06, 0.14, 0.06], scale: [1, 1.04, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <FloatingCuteStickers />
        <FloatingHearts />
      </div>
      <SparkleOverlay active={showSparkles} />
      {(stage === "celebration" || stage === "memories") && (
        <motion.p
          className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-lg font-semibold text-pink-600 drop-shadow-lg"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎈 Tap the balloons to see surprises 🎁
        </motion.p>
      )}
      <audio
        ref={musicRef}
        src="/romantic.mp3"
        loop
      />
      {!isLiteMotion &&
        hearts.map((heart) => (
          <motion.div
            key={heart.id}
            style={{
              left: heart.x,
              top: heart.y,
              position: "fixed",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: -40, opacity: 0 }}
            transition={{ duration: 0.65 }}
            className={`text-xl pointer-events-none z-50 ${theme.secondaryText}`}
          >
            💖
          </motion.div>
        ))}
      <div className="relative z-50">
        <div className="min-h-screen w-full max-w-screen-lg mx-auto flex items-center justify-center py-12 pt-28">
          <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`p-8 rounded-3xl text-center max-w-2xl w-full relative ${theme.cardBackground} ${theme.glowColor} ${theme.primaryText}`}
            >
              <p
                className="typing-effect text-xl mb-8"
                onAnimationEnd={() => scheduleTimeout(() => setStage("question"), 1000)}
              >
                Hey… I have something important to ask you 💌
              </p>
            </motion.div>
          )}

          {stage === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-8 rounded-3xl text-center max-w-2xl w-full relative ${theme.cardBackground} ${theme.glowColor} ${theme.primaryText}`}
            >
              <h2 className={`text-3xl font-handwritten mb-8 text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}>
                Will you be my Valentine? 💖
              </h2>

              <div ref={containerRef} className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8 min-h-[100px]">
                <motion.button
                  onClick={handleYes}
                  className={`w-full md:w-auto px-8 py-4 min-h-[44px] rounded-2xl text-lg font-semibold z-10 ${theme.buttonPrimary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ boxShadow: "0 0 20px hsl(var(--primary))" }}
                >
                  YES 💕
                </motion.button>

                <motion.button
                  ref={noButtonRef}
                  onMouseEnter={handleNoHover}
                  onMouseMove={handleNoMove}
                  className={`w-full md:w-auto px-8 py-4 min-h-[44px] rounded-2xl text-lg font-semibold relative ${theme.buttonSecondary}`}
                  whileHover={{ scale: 0.9, rotate: [0, -5, 5, 0] }}
                  animate={{
                    x: [0, 5, -5, 0],
                    y: [0, -3, 3, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  NO 😅
                  <span className="absolute -top-2 -right-2 text-sm animate-bounce">🥺</span>
                  <span className="absolute -bottom-2 -left-2 text-sm animate-pulse">👉👈</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === "celebration" && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-screen flex flex-col items-center justify-center text-center z-50"
            >
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className={`absolute inset-x-0 top-1/2 h-56 -translate-y-1/2 bg-gradient-to-r ${theme.accentGradient} blur-3xl opacity-20`}
                  animate={{ opacity: [0.12, 0.28, 0.12] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-yellow-300/40 to-pink-400/40 rounded-full blur-3xl animate-pulse" />

              <motion.div
                className="relative z-10 w-full max-w-3xl px-6 md:px-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className={`text-xs md:text-sm uppercase tracking-[0.24em] mb-3 ${theme.secondaryText}`}
                >
                  Celebration
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.55 }}
                  className={`text-5xl md:text-7xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}
                >
                  Yesssss 💖
                </motion.h1>

                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.55 }}
                  className={`mt-6 text-2xl md:text-4xl font-medium ${theme.primaryText}`}
                >
                  I won you 🥰
                </motion.p>

                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.48, duration: 0.55 }}
                  className={`text-xl md:text-3xl ${theme.secondaryText}`}
                >
                  I love you so much!
                </motion.p>

                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.62, duration: 0.55 }}
                  className={`text-xl md:text-3xl font-medium ${theme.primaryText}`}
                >
                  You are my Valentine 💕
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {stage === "memories" && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-5 sm:p-6 md:p-8 rounded-3xl text-center max-w-screen-lg w-full relative ${theme.cardBackground} ${theme.glowColor} ${theme.primaryText}`}
            >
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`text-4xl font-handwritten mb-6 drop-shadow-lg ${theme.primaryText}`}
              >
                🎉 She said YES! 🎉
              </motion.h2>

              {duration && stage === "memories" && (
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`
relative
w-full
max-w-4xl
mx-auto
mb-10
text-center
rounded-3xl
bg-gradient-to-r
p-8
shadow-[0_0_60px_rgba(255,0,100,0.5)]
 ${theme.accentGradient}
`}
                >
                  <div className="absolute inset-0 -z-10">
                    <motion.div
                      className={`w-full h-full bg-gradient-to-r ${theme.accentGradient} blur-3xl opacity-20`}
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    />
                  </div>
                  {!isLiteMotion && (
                    <div className="absolute inset-0 pointer-events-none">
                      {TIMER_PARTICLES.map((particle, index) => (
                        <motion.span
                          key={`${particle.left}-${particle.top}`}
                          className="absolute h-2.5 w-2.5 rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                          style={{ left: particle.left, top: particle.top }}
                          animate={{ y: [0, -10, 0], opacity: [0.3, 0.85, 0.3], scale: [0.8, 1.15, 0.8] }}
                          transition={{
                            duration: 3.8 + index * 0.45,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: particle.delay,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <p className={`text-sm tracking-widest uppercase ${theme.primaryText}`}>
                    OUR LOVE HAS BEEN RUNNING FOR ❤️
                  </p>

                  <div className={`mt-4 text-5xl md:text-6xl font-bold drop-shadow-2xl leading-tight ${theme.primaryText}`}>
                    <div>{duration.years} YEARS</div>
                    <div>{duration.months} MONTH</div>
                    <div>{duration.days} DAY</div>
                  </div>

                  <p className={`mt-5 text-xl md:text-2xl ${theme.secondaryText}`}>
                    {duration.hours} HOURS • {duration.minutes} MINUTES • {duration.seconds} SECONDS
                  </p>

                  <p className={`mt-5 text-sm tracking-widest uppercase ${theme.secondaryText}`}>
                    AND IT WILL NEVER STOP ✨
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h3 className={`text-lg md:text-xl font-handwritten mb-4 drop-shadow-md ${theme.primaryText}`}>💌 A message from your heart</h3>
                <p className={`text-base md:text-lg italic p-4 md:p-5 rounded-2xl ${theme.secondaryText} ${theme.cardBackground}`}>
                  {message}
                </p>
              </motion.div>

              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <h3 className={`text-lg md:text-xl font-handwritten mb-6 drop-shadow-md ${theme.primaryText}`}>🖼️ Our memories together</h3>
                  <div {...handlers} className="w-full max-w-4xl mx-auto mt-8 md:mt-10 touch-pan-y select-none overflow-hidden">
                    <div className={`rounded-3xl p-3 sm:p-4 md:p-6 ${theme.cardBackground} ${theme.glowColor}`}>
                      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] overflow-hidden rounded-2xl">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.img
                            key={`${images[currentIndex].url}-${currentIndex}`}
                            src={images[currentIndex].url}
                            alt="Memory"
                            className="w-full h-full object-contain"
                            initial={{ opacity: 0, x: slideDirection * 120 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: slideDirection * -120 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </AnimatePresence>

                        <button
                          type="button"
                          aria-label="Previous slide"
                          className={`hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center text-xl md:text-2xl min-h-[44px] rounded-full ${theme.cardBackground} ${theme.primaryText}`}
                          onClick={goToPrevSlide}
                        >
                          ◀
                        </button>

                        <button
                          type="button"
                          aria-label="Next slide"
                          className={`hidden md:inline-flex absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center text-xl md:text-2xl min-h-[44px] rounded-full ${theme.cardBackground} ${theme.primaryText}`}
                          onClick={goToNextSlide}
                        >
                          ▶
                        </button>
                      </div>

                      <div className="mt-5 min-h-[92px] flex items-center justify-center">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={`caption-${images[currentIndex].url}-${images[currentIndex].caption || "empty"}`}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className={`px-6 py-3 rounded-2xl ${theme.cardBackground}`}
                          >
                            <p className={`text-lg font-semibold text-center ${theme.primaryText}`}>
                              💌 {images[currentIndex].caption?.trim() || ""}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-4">
                      {images.map((_, idx) => (
                        <span
                          key={idx}
                          className={
                            idx === currentIndex
                              ? "w-4 h-4 bg-primary rounded-full"
                              : "w-3 h-3 bg-primary/40 rounded-full"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {timeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <TimelineSection entries={timeline} />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 + images.length * 0.5 }}
                className={`mt-12 pt-8 border-t ${theme.divider}`}
              >
                <h3 className="text-xl font-handwritten mb-4">💖 Want to create your own magical Valentine?</h3>
                <motion.button
                  onClick={handleCreateOwn}
                  className={`w-full sm:w-auto px-8 py-4 min-h-[44px] rounded-2xl text-lg font-semibold ${theme.buttonPrimary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Yours 💌
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
      </div>
    </>
  );
}
