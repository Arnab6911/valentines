import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useTheme } from "@/contexts/ThemeContext";

export interface TimelineEntry {
  imageUrl: string;
  date: string;
  title: string;
  description: string;
}

interface TimelineSectionProps {
  entries: TimelineEntry[];
}

interface TimelineItem extends TimelineEntry {
  id: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function TimelineSection({ entries }: TimelineSectionProps) {
  const { theme } = useTheme();
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);

  const timelineItems = useMemo<TimelineItem[]>(
    () =>
      entries.map((item, index) => ({
        ...item,
        id: `${item.date}-${item.title}-${index}`,
      })),
    [entries],
  );

  useEffect(() => {
    if (!selectedTimelineItem) return;

    const handleEscClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTimelineItem(null);
      }
    };

    window.addEventListener("keydown", handleEscClose);
    return () => window.removeEventListener("keydown", handleEscClose);
  }, [selectedTimelineItem]);

  if (!timelineItems.length) return null;

  return (
    <section className="w-full max-w-screen-lg mx-auto mt-14 px-1 sm:px-2 md:px-2 overflow-x-hidden">
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4 }}
        className={`text-2xl md:text-3xl font-handwritten text-center mb-8 ${theme.primaryText}`}
      >
        🚉 Our Journey
      </motion.h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative pb-2"
      >
        <div className={`absolute top-0 bottom-0 left-5 md:left-1/2 md:-translate-x-1/2 w-[3px] rounded-full bg-gradient-to-b ${theme.accentGradient}`} />

        {timelineItems.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.article key={item.id} variants={itemVariants} className="relative mb-8 md:mb-10">
              <span
                className={`absolute top-8 left-5 md:left-1/2 md:-translate-x-1/2 z-10 h-4 w-4 rounded-full ${theme.primaryText} bg-current ring-4 ring-white/40 shadow-[0_0_18px_rgba(255,105,180,0.8)]`}
              />

              <div className="grid md:grid-cols-2 md:gap-10">
                <div className={`pl-14 pr-1 md:pr-0 md:pl-0 ${isLeft ? "md:col-start-1" : "md:col-start-2"}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`rounded-2xl p-4 md:p-5 ${theme.cardBackground} ${theme.glowColor}`}
                  >
                    <div className="relative w-full flex justify-center items-center mb-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full max-h-[500px] object-contain rounded-2xl shadow-lg cursor-pointer"
                        onClick={() => setSelectedTimelineItem(item)}
                      />
                    </div>
                    <p className={`text-sm font-medium ${theme.secondaryText}`}>{item.date}</p>
                    <h4 className={`text-xl font-semibold mt-1 ${theme.primaryText}`}>{item.title}</h4>
                    <p className={`mt-2 text-sm md:text-base ${theme.secondaryText}`}>{item.description}</p>
                  </motion.div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selectedTimelineItem && (
          <motion.div
            key={selectedTimelineItem.id}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => setSelectedTimelineItem(null)}
          >
            <motion.div
              key={selectedTimelineItem.id}
              className={`relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 md:p-8 border border-white/20 ${theme.cardBackground} backdrop-blur-xl shadow-[0_0_40px_rgba(255,105,180,0.5)]`}
              initial={{ scale: 0.8, opacity: 0, rotateY: -7 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.88, opacity: 0, rotateY: 6 }}
              transition={{
                duration: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <motion.div
                className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${theme.accentGradient} opacity-25 blur-2xl`}
                animate={{ opacity: [0.2, 0.38, 0.2], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.button
                type="button"
                onClick={() => setSelectedTimelineItem(null)}
                whileHover={{ scale: 1.08, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute right-4 top-4 h-10 w-10 rounded-full text-lg font-bold leading-none grid place-items-center ${theme.primaryText} bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_0_18px_rgba(255,255,255,0.35)]`}
                aria-label="Close modal"
              >
                ×
              </motion.button>

              <div className="flex justify-center">
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.3 }}
                  className={`inline-flex items-center rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] ${theme.primaryText} bg-white/25 border border-white/35 shadow-[0_0_18px_rgba(255,255,255,0.3)]`}
                >
                  {selectedTimelineItem.date}
                </motion.p>
              </div>

              <motion.h4
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className={`mt-3 text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}
              >
                {selectedTimelineItem.title}
              </motion.h4>

              <motion.div
                className="relative w-full flex justify-center items-center mt-5 mb-5 rounded-3xl p-3 sm:p-4 border border-white/25 bg-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] overflow-hidden"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {[
                  { icon: "💖", className: "top-3 left-4" },
                  { icon: "💕", className: "top-5 right-6" },
                  { icon: "💞", className: "bottom-4 left-8" },
                  { icon: "✨", className: "bottom-3 right-5" },
                ].map((particle, index) => (
                  <motion.span
                    key={`${particle.icon}-${index}`}
                    className={`absolute pointer-events-none text-base sm:text-lg ${particle.className}`}
                    animate={{ y: [0, -6, 0], opacity: [0.35, 0.75, 0.35] }}
                    transition={{
                      duration: 2.8 + index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {particle.icon}
                  </motion.span>
                ))}
                <img
                  src={selectedTimelineItem.imageUrl}
                  alt={selectedTimelineItem.title}
                  className="w-full max-h-[62vh] object-contain rounded-3xl shadow-2xl"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35 }}
                className={`text-base md:text-lg leading-relaxed text-center ${theme.primaryText}`}
              >
                {selectedTimelineItem.description}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
