import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { useValentine, useFindValentineForViewer, Reaction } from '@/hooks/useValentine';
import { FloatingHearts, Sparkles, HeartBurst } from '@/components/animations/FloatingHearts';
import { Button } from '@/components/ui/button';

type Stage = 'intro' | 'question' | 'processing' | 'celebration' | 'message' | 'photos' | 'ai' | 'reactions';

export const ViewerExperience: React.FC = () => {
  const { signOut, user } = useAuth();
  const { valentine, loading, addReaction } = useValentine();
  const { exists } = useFindValentineForViewer();
  
  const [stage, setStage] = useState<Stage>('intro');
  const [typedText, setTypedText] = useState('');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [yesBigger, setYesBigger] = useState(1);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const introText = "Hey...\nI have something important to ask you 💌";

  // Typing effect for intro
  useEffect(() => {
    if (stage === 'intro') {
      let index = 0;
      const timer = setInterval(() => {
        if (index < introText.length) {
          setTypedText(introText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setTimeout(() => setStage('question'), 1500);
        }
      }, 80);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Check if it's night time
  const isNight = new Date().getHours() >= 19 || new Date().getHours() < 6;

  const handleNoHover = () => {
    const newX = (Math.random() - 0.5) * 300;
    const newY = (Math.random() - 0.5) * 200;
    setNoButtonPos({ x: newX, y: newY });
    setYesBigger(prev => Math.min(prev + 0.15, 2));
  };

  const handleYesClick = () => {
    setStage('processing');
    setTimeout(() => {
      setStage('celebration');
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185']
      });
    }, 2000);
  };

  const handleReaction = (type: Reaction['type']) => {
    setShowHeartBurst(true);
    addReaction(type);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  const nextStage = () => {
    const stages: Stage[] = ['celebration', 'message', 'photos', 'ai', 'reactions'];
    const currentIndex = stages.indexOf(stage);
    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isNight ? 'bg-[hsl(260,30%,12%)]' : 'gradient-dream'}`}>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl"
        >
          💖
        </motion.div>
      </div>
    );
  }

  // No Valentine created yet
  if (!exists || !valentine) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isNight ? 'bg-[hsl(260,30%,12%)]' : 'gradient-dream'}`}>
        <FloatingHearts count={15} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 bg-card/80 backdrop-blur-xl rounded-3xl p-12 shadow-float"
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ 
              y: [0, -10, 0],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🕰️💤
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Nothing here yet...
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-md">
            💌 Someone special needs to create this surprise for you first
            <br /><br />
            ✨ Please check back later
          </p>
          <Button onClick={signOut} className="rounded-xl">
            Sign out 👋
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isNight ? 'bg-[hsl(260,30%,12%)] text-white' : 'gradient-dream'}`}>
      <FloatingHearts count={20} />
      
      {/* Music Toggle */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-xl rounded-full px-4 py-2 shadow-soft"
        onClick={() => setMusicEnabled(!musicEnabled)}
      >
        {musicEnabled ? '🔊 Music On' : '🔇 Music Off'}
      </motion.button>

      <AnimatePresence mode="wait">
        {/* INTRO STAGE */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center">
              <motion.p
                className="text-3xl md:text-5xl font-bold whitespace-pre-line leading-relaxed"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
              >
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  |
                </motion.span>
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* QUESTION STAGE */}
        {stage === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-7xl font-bold mb-12"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles>
                  Will you be my Valentine? 💕
                </Sparkles>
              </motion.h1>

              <div className="flex items-center justify-center gap-8 relative">
                {/* YES Button */}
                <motion.button
                  onClick={handleYesClick}
                  className="px-12 py-6 rounded-3xl text-2xl font-bold gradient-love text-primary-foreground shadow-glow"
                  animate={{ 
                    scale: [yesBigger, yesBigger * 1.05, yesBigger],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ transform: `scale(${yesBigger})` }}
                  whileHover={{ scale: yesBigger * 1.1 }}
                  whileTap={{ scale: yesBigger * 0.95 }}
                >
                  ❤️ YES
                </motion.button>

                {/* NO Button (runs away) */}
                <motion.button
                  onMouseEnter={handleNoHover}
                  onClick={handleNoHover}
                  className="px-8 py-4 rounded-2xl text-lg font-medium bg-muted text-muted-foreground"
                  animate={{ 
                    x: noButtonPos.x,
                    y: noButtonPos.y,
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  💔 no
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PROCESSING STAGE */}
        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center">
              <motion.div
                className="text-8xl mb-8"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.5, repeat: Infinity }
                }}
              >
                💖
              </motion.div>
              <motion.p
                className="text-2xl font-medium"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Processing your answer... ❤️
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* CELEBRATION STAGE */}
        {stage === 'celebration' && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center">
              <motion.div
                className="text-8xl mb-8"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [-10, 10, -10]
                }}
                transition={{ duration: 0.5, repeat: 5 }}
              >
                🎉💕🎊
              </motion.div>
              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-8"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
              >
                Yaaay! 🥳💖
              </motion.h2>
              <motion.p
                className="text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You made someone very happy! ✨
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={nextStage}
                  className="rounded-2xl gradient-love text-primary-foreground text-xl px-8 py-6"
                >
                  See what's next 💝
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* MESSAGE STAGE */}
        {stage === 'message' && valentine.showLoveMessage && valentine.loveMessage && (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <motion.div
              className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-2xl shadow-float"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
            >
              <motion.div
                className="text-5xl text-center mb-6"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💌
              </motion.div>
              <h3 className="text-2xl font-bold text-center mb-6 text-primary">
                A cute text from your lover
              </h3>
              <motion.p
                className="text-xl md:text-2xl font-handwritten text-center leading-relaxed text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {valentine.loveMessage}
              </motion.p>
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={nextStage}
                  className="rounded-2xl gradient-love text-primary-foreground"
                >
                  Continue 💕
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* PHOTOS STAGE */}
        {stage === 'photos' && valentine.photos && valentine.photos.length > 0 && (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center w-full max-w-4xl">
              <motion.h3
                className="text-3xl font-bold mb-8"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
              >
                📸 Our Memories 💕
              </motion.h3>
              
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhotoIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-card rounded-3xl overflow-hidden shadow-float"
                  >
                    <img
                      src={valentine.photos[currentPhotoIndex].url}
                      alt={valentine.photos[currentPhotoIndex].caption}
                      className="w-full h-[400px] object-cover"
                    />
                    <div className="p-6">
                      <p className="text-xl font-handwritten text-muted-foreground">
                        {valentine.photos[currentPhotoIndex].caption}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={() => setCurrentPhotoIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentPhotoIndex === 0}
                    className="rounded-xl"
                    variant="outline"
                  >
                    ← Previous
                  </Button>
                  <span className="flex items-center text-muted-foreground">
                    {currentPhotoIndex + 1} / {valentine.photos.length}
                  </span>
                  <Button
                    onClick={() => {
                      if (currentPhotoIndex === valentine.photos.length - 1) {
                        nextStage();
                      } else {
                        setCurrentPhotoIndex(prev => prev + 1);
                      }
                    }}
                    className="rounded-xl gradient-love text-primary-foreground"
                  >
                    {currentPhotoIndex === valentine.photos.length - 1 ? 'Continue 💕' : 'Next →'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI ILLUSTRATION STAGE */}
        {stage === 'ai' && valentine.aiIllustration && (
          <motion.div
            key="ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center max-w-2xl">
              <motion.h3
                className="text-3xl font-bold mb-6"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
              >
                ✨ A dreamy moment imagined just for us
              </motion.h3>
              
              <motion.div
                className="bg-card rounded-3xl p-8 shadow-float mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div className="text-8xl mb-4">
                  {valentine.aiIllustration.scene === 'proposal' && '💍'}
                  {valentine.aiIllustration.scene === 'date' && '☕'}
                  {valentine.aiIllustration.scene === 'stars' && '🌙'}
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  A {valentine.aiIllustration.mood} {valentine.aiIllustration.scene} scene
                </p>
                <p className="text-xl font-handwritten text-primary">
                  "Some moments are imagined… but the feelings are real 💖"
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  🔒 Artistic illustration. No real photos used.
                </p>
              </motion.div>

              <Button
                onClick={nextStage}
                className="rounded-2xl gradient-love text-primary-foreground"
              >
                Continue 💕
              </Button>
            </div>
          </motion.div>
        )}

        {/* REACTIONS STAGE */}
        {stage === 'reactions' && (
          <motion.div
            key="reactions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center relative">
              <HeartBurst active={showHeartBurst} />
              
              <motion.h3
                className="text-3xl font-bold mb-8"
                style={{ color: isNight ? 'white' : 'hsl(var(--foreground))' }}
              >
                🥰 How did this make you feel?
              </motion.h3>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { type: 'love' as const, emoji: '❤️', label: 'Love this' },
                  { type: 'emotional' as const, emoji: '🥹', label: 'Emotional' },
                  { type: 'cute' as const, emoji: '😆', label: 'Cute' },
                ].map((reaction) => (
                  <motion.button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    className="px-8 py-4 rounded-2xl bg-card shadow-soft border border-border hover:border-primary transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-3xl block mb-2">{reaction.emoji}</span>
                    <span className="font-medium">{reaction.label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.p
                className="text-xl text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Thank you for being my Valentine 💕
              </motion.p>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button onClick={signOut} variant="ghost" className="rounded-xl">
                  Sign out 👋
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip stages if content doesn't exist */}
      {stage === 'message' && (!valentine.showLoveMessage || !valentine.loveMessage) && (
        <motion.div onAnimationComplete={nextStage} />
      )}
      {stage === 'photos' && (!valentine.photos || valentine.photos.length === 0) && (
        <motion.div onAnimationComplete={nextStage} />
      )}
      {stage === 'ai' && !valentine.aiIllustration && (
        <motion.div onAnimationComplete={nextStage} />
      )}
    </div>
  );
};
