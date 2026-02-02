import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FloatingHearts } from "@/components/animations/FloatingHearts";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-dream flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts count={15} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 bg-card/80 backdrop-blur-xl rounded-3xl p-12 shadow-float"
      >
        <motion.div
          className="text-8xl mb-6"
          animate={{ 
            rotate: [-10, 10, -10],
            y: [0, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💔
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Oops! Lost in love 🥺
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          This page doesn't exist... but our love does! 💕
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate("/")}
            className="rounded-2xl gradient-love text-primary-foreground text-lg px-8 py-6"
          >
            Take me home 💝
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
