import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function SparkleOverlay({ active }: { active: boolean }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (active) {
      const newSparkles: Sparkle[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 20,
        delay: Math.random() * 2,
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => setSparkles([]), 5000);
      return () => clearTimeout(timer);
    } else {
      setSparkles([]);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute text-gold"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                fontSize: sparkle.size,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                delay: sparkle.delay,
                ease: "easeOut",
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
