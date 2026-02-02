import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingHearts, Bubbles } from '@/components/animations/FloatingHearts';

export const RoleSelection: React.FC = () => {
  const { setSelectedRole } = useAuth();

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -10,
      boxShadow: "0 20px 50px -15px rgba(236, 72, 153, 0.4)"
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen gradient-dream flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts count={25} />
      <Bubbles />
      
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-foreground mb-4"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            💕 Who are you here as?
          </motion.h1>
          <p className="text-xl text-muted-foreground">
            Choose your magical journey ✨
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {/* Creator Card */}
          <motion.button
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => setSelectedRole('creator')}
            className="w-72 h-80 rounded-3xl bg-card border-2 border-primary/30 p-8 flex flex-col items-center justify-center gap-4 shadow-float cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-love opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            
            <motion.div 
              className="text-7xl"
              animate={{ 
                rotate: [-5, 5, -5],
                y: [0, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎁💌
            </motion.div>
            
            <h2 className="text-2xl font-bold text-primary">
              CREATOR
            </h2>
            
            <p className="text-muted-foreground text-center leading-relaxed">
              "I want to create a<br />Valentine surprise"
            </p>
            
            <motion.div
              className="absolute -bottom-2 -right-2 text-6xl opacity-20"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌸
            </motion.div>
          </motion.button>

          {/* Viewer Card */}
          <motion.button
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => setSelectedRole('viewer')}
            className="w-72 h-80 rounded-3xl bg-card border-2 border-secondary/50 p-8 flex flex-col items-center justify-center gap-4 shadow-float cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            
            <motion.div 
              className="text-7xl"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎀💖
            </motion.div>
            
            <h2 className="text-2xl font-bold text-secondary-foreground">
              VIEWER
            </h2>
            
            <p className="text-muted-foreground text-center leading-relaxed">
              "Someone made something<br />special for me"
            </p>
            
            <motion.div
              className="absolute -bottom-2 -left-2 text-6xl opacity-20"
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
