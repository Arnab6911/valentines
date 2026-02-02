import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

const emojis = ['💕', '💖', '💗', '💝', '💘', '❤️', '🩷', '✨', '🌸', '🦋', '⭐'];

export const FloatingHearts: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    const newHearts: FloatingHeart[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 16 + Math.random() * 24,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    setHearts(newHearts);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            bottom: '-50px',
            fontSize: heart.size
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(heart.id) * 50, -Math.sin(heart.id) * 30, 0],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {heart.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export const Sparkles: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSparkle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100
      };
      setSparkles(prev => [...prev.slice(-10), newSparkle]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            className="absolute pointer-events-none text-gold"
            style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const HeartBurst: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl pointer-events-none"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 1 
              }}
              animate={{ 
                x: Math.cos(i * 30 * Math.PI / 180) * 100,
                y: Math.sin(i * 30 * Math.PI / 180) * 100,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              💖
            </motion.span>
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

export const Bubbles: React.FC = () => {
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 10 + Math.random() * 30,
    duration: 5 + Math.random() * 5,
    delay: Math.random() * 3
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20"
          style={{
            left: `${bubble.x}%`,
            bottom: '-50px',
            width: bubble.size,
            height: bubble.size
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(bubble.id * 0.5) * 30],
            opacity: [0.5, 0.8, 0.5, 0]
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
