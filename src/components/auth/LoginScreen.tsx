import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingHearts } from '@/components/animations/FloatingHearts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const LoginScreen: React.FC = () => {
  const { selectedRole, setSelectedRole, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, selectedRole === 'creator');
        toast.success('Account created! 💕 Welcome to your love story!');
      } else {
        await signIn(email, password);
        toast.success('Welcome back! 💖');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found 🥺 Try signing up!');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Oops! Wrong password 💔');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already taken 💌');
      } else {
        toast.error('Something went wrong 🥺 Try again!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dream flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts count={15} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-float border border-primary/20">
          {/* Back Button */}
          <motion.button
            onClick={() => setSelectedRole(null)}
            className="absolute top-4 left-4 text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ← Back
          </motion.button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-5xl mb-4"
              animate={{ 
                rotate: [-5, 5, -5],
                y: [0, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {selectedRole === 'creator' ? '🎁' : '💝'}
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedRole === 'creator' ? 'Create Magic 💫' : 'Open Your Gift 🎀'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Create your account' : 'Welcome back, cutie!'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email 💌
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="rounded-xl border-primary/30 focus:border-primary focus:ring-primary/30 bg-background/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password 🔐
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="rounded-xl border-primary/30 focus:border-primary focus:ring-primary/30 bg-background/50"
                />
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-semibold gradient-love text-primary-foreground shadow-glow hover:shadow-glow transition-all duration-300"
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    💖
                  </motion.span>
                ) : (
                  isSignUp ? "Let's gooo 😍" : "Okayyy 💕"
                )}
              </Button>
            </motion.div>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in 💖' 
                : "Don't have an account? Sign up 💕"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
