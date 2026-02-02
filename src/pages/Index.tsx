import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleSelection } from '@/components/auth/RoleSelection';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { CreatorDashboard } from '@/components/creator/CreatorDashboard';
import { ViewerExperience } from '@/components/viewer/ViewerExperience';
import { motion } from 'framer-motion';
import { FloatingHearts } from '@/components/animations/FloatingHearts';

const Index: React.FC = () => {
  const { user, role, selectedRole, loading } = useAuth();

  // Auto day/night mode
  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 6;
    
    if (isNight) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-dream flex items-center justify-center">
        <FloatingHearts count={15} />
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-8xl mb-6"
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
            className="text-xl font-medium text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Loading magic... ✨
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Step 1: No role selected - show role selection
  if (!selectedRole) {
    return <RoleSelection />;
  }

  // Step 2: Role selected but not logged in - show login
  if (!user) {
    return <LoginScreen />;
  }

  // Step 3: Logged in - show appropriate dashboard
  if (selectedRole === 'creator' || role === 'creator') {
    return <CreatorDashboard />;
  }

  // Step 4: Viewer experience
  return <ViewerExperience />;
};

export default Index;
