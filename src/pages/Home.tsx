import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { FloatingHearts } from "@/components/animations/FloatingHearts";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden px-4 ${theme.background}`}>
      <FloatingHearts />

      <div className="w-full max-w-screen-lg mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`${theme.cardBackground} ${theme.glowColor} p-10 rounded-3xl text-center max-w-md relative z-10 ${theme.primaryText}`}
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={`text-5xl font-handwritten mb-6 text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}
          >
            Surprise Gift
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`mb-8 text-lg ${theme.secondaryText}`}
          >
            A sweet Valentine surprise made with love.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 min-h-[44px] rounded-xl font-semibold text-lg ${theme.buttonPrimary}`}
            onClick={() => navigate("/auth")}
          >
            Create Your Valentine
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
