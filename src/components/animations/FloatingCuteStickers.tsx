import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Sticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const stickers = ["🐱", "😺", "🧸", "💌", "💖", "✨", "🌟", "🎀", "🎗️"];

export const FloatingCuteStickers: React.FC = () => {
  const [stickersList, setStickersList] = useState<Sticker[]>([]);

  useEffect(() => {
    const newStickers: Sticker[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: stickers[Math.floor(Math.random() * stickers.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 24 + Math.random() * 16,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 2,
    }));
    setStickersList(newStickers);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30 opacity-70">
      {stickersList.map((sticker) => (
        <motion.div
          key={sticker.id}
          className="absolute"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            fontSize: sticker.size,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: sticker.duration,
            delay: sticker.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {sticker.emoji}
        </motion.div>
      ))}
    </div>
  );
};
