import React from 'react';
import { motion } from 'framer-motion';
import { PersonalityMode, PERSONALITY_PROFILES, getPersonalityTheme } from '@/types/personality';
import { useWidgetStore } from '@/stores/widgetStore';
import { cn } from '@/utils/cn';

interface CollapsedWidgetProps {
  personality: PersonalityMode;
  className?: string;
}

export const CollapsedWidget: React.FC<CollapsedWidgetProps> = ({ 
  personality, 
  className 
}) => {
  const { voice } = useWidgetStore();
  const personalityProfile = PERSONALITY_PROFILES[personality];
  const personalityTheme = getPersonalityTheme(personality);

  // Breathing animation for idle state
  const breathingVariants = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    listening: {
      scale: [1, 1.1, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    processing: {
      rotate: [0, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Determine animation state based on voice state
  const getAnimationState = () => {
    if (voice.isProcessing) return 'processing';
    if (voice.isListening) return 'listening';
    return 'idle';
  };

  // Personality-specific gradient backgrounds
  const getPersonalityGradient = () => {
    const gradients = {
      [PersonalityMode.SERIOUS]: 'from-blue-400 to-blue-600',
      [PersonalityMode.GOOFY]: 'from-red-400 to-pink-500',
      [PersonalityMode.CREATIVE]: 'from-green-400 to-emerald-500',
      [PersonalityMode.ADAPTIVE]: 'from-amber-400 to-orange-500',
      [PersonalityMode.PROFESSIONAL]: 'from-indigo-400 to-purple-600',
      [PersonalityMode.CASUAL]: 'from-purple-400 to-pink-500',
    };
    return gradients[personality];
  };

  return (
    <motion.div
      className={cn(
        'relative w-full h-full rounded-full overflow-hidden',
        'flex items-center justify-center',
        'bg-gradient-to-br',
        getPersonalityGradient(),
        'shadow-lg',
        className
      )}
      variants={breathingVariants}
      animate={getAnimationState()}
      style={{
        boxShadow: personalityTheme.shadow,
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent" />
      </div>

      {/* Personality Icon */}
      <motion.div
        className="relative z-10 text-2xl"
        animate={{
          rotate: voice.isProcessing ? [0, 360] : 0,
        }}
        transition={{
          duration: voice.isProcessing ? 2 : 0,
          repeat: voice.isProcessing ? Infinity : 0,
          ease: "linear"
        }}
      >
        {personalityProfile.icon}
      </motion.div>

      {/* Voice Activity Indicator */}
      {voice.isListening && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Processing Spinner */}
      {voice.isProcessing && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-white/80 border-r-white/60 border-b-white/40 border-l-white/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Subtle Brand Text */}
      <motion.div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
          TwoSoul
        </span>
      </motion.div>

      {/* Hover Hint */}
      <motion.div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0, y: 0 }}
        whileHover={{ opacity: 0.8, y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Click to expand
        </div>
      </motion.div>

      {/* Personality Mode Indicator */}
      <motion.div
        className="absolute -right-2 -top-2 w-4 h-4 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: personalityTheme.primary }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Voice Volume Indicator */}
      {voice.isListening && voice.volume > 0 && (
        <motion.div
          className="absolute bottom-1 right-1 flex space-x-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-white/80 rounded-full"
              animate={{
                height: voice.volume > (i + 1) * 0.33 ? [2, 6, 2] : 2,
              }}
              transition={{
                duration: 0.3,
                repeat: voice.volume > (i + 1) * 0.33 ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
