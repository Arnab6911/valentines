import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { FloatingHearts } from "@/components/animations/FloatingHearts";
import { useTheme } from "@/contexts/ThemeContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 px-4 relative overflow-hidden ${theme.background}`}>
      <FloatingHearts count={15} />

      <div className="w-full max-w-screen-lg mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center relative z-10 rounded-3xl p-12 ${theme.cardBackground} ${theme.glowColor} ${theme.primaryText}`}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ rotate: [-10, 10, -10], y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💔
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">Oops! Lost in love</h1>

          <p className={`text-xl mb-8 ${theme.secondaryText}`}>This page does not exist.</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className={`rounded-2xl text-lg px-8 py-4 min-h-[44px] ${theme.buttonPrimary}`}
          >
            Take me home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
