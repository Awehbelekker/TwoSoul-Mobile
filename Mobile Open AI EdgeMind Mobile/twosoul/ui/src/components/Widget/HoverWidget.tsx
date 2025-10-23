import React from 'react';
import { motion } from 'framer-motion';
import { PersonalityMode, PERSONALITY_PROFILES, getPersonalityTheme } from '@/types/personality';
import { useWidgetStore } from '@/stores/widgetStore';
import { Mic, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HoverWidgetProps {
  personality: PersonalityMode;
  className?: string;
}

export const HoverWidget: React.FC<HoverWidgetProps> = ({ 
  personality, 
  className 
}) => {
  const { voice, interactionMode, setState } = useWidgetStore();
  const personalityProfile = PERSONALITY_PROFILES[personality];
  const personalityTheme = getPersonalityTheme(personality);

  // Quick greeting based on personality
  const getQuickGreeting = () => {
    const greetings = {
      [PersonalityMode.SERIOUS]: "Ready to help! What can I do for you?",
      [PersonalityMode.GOOFY]: "Hey there! 🎉 Ready for some fun?",
      [PersonalityMode.CREATIVE]: "✨ Let's create something amazing together!",
      [PersonalityMode.ADAPTIVE]: "Hi! How can I help you today?",
      [PersonalityMode.PROFESSIONAL]: "Good day. How may I assist you?",
      [PersonalityMode.CASUAL]: "Hey! What's up? 😊",
    };
    return greetings[personality];
  };

  // Handle quick actions
  const handleVoiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle voice listening
    useWidgetStore.getState().updateVoiceState({ 
      isListening: !voice.isListening 
    });
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState('expanded' as any);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    useWidgetStore.getState().toggleSettings();
  };

  return (
    <motion.div
      className={cn(
        'relative w-full h-full rounded-2xl overflow-hidden',
        'backdrop-blur-md border border-opacity-30',
        personalityProfile.fontFamily,
        className
      )}
      style={{
        backgroundColor: personalityTheme.background,
        borderColor: personalityTheme.border,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-opacity-20"
           style={{ borderColor: personalityTheme.border }}>
        <div className="flex items-center space-x-2">
          <motion.span 
            className="text-lg"
            animate={{ rotate: voice.isProcessing ? 360 : 0 }}
            transition={{ duration: 2, repeat: voice.isProcessing ? Infinity : 0 }}
          >
            {personalityProfile.icon}
          </motion.span>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: personalityTheme.text }}>
              TwoSoul ({personalityProfile.name})
            </h3>
            <p className="text-xs opacity-70" style={{ color: personalityTheme.text }}>
              {personalityProfile.tone_description}
            </p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: personalityTheme.primary }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Quick Greeting */}
      <div className="p-3">
        <motion.p 
          className="text-sm leading-relaxed"
          style={{ color: personalityTheme.text }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {getQuickGreeting()}
        </motion.p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center space-x-4 p-3 border-t border-opacity-20"
           style={{ borderColor: personalityTheme.border }}>
        
        {/* Voice Button */}
        <motion.button
          className={cn(
            'flex items-center space-x-1 px-3 py-2 rounded-lg',
            'transition-all duration-200',
            'hover:scale-105 active:scale-95',
            voice.isListening ? 'bg-red-500/20 text-red-600' : 'bg-opacity-20 hover:bg-opacity-30'
          )}
          style={{
            backgroundColor: voice.isListening ? undefined : personalityTheme.primary + '20',
            color: voice.isListening ? undefined : personalityTheme.text,
          }}
          onClick={handleVoiceClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Mic size={14} className={voice.isListening ? 'animate-pulse' : ''} />
          <span className="text-xs font-medium">
            {voice.isListening ? 'Listening...' : 'Voice'}
          </span>
        </motion.button>

        {/* Chat Button */}
        <motion.button
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          style={{
            backgroundColor: personalityTheme.primary + '20',
            color: personalityTheme.text,
          }}
          onClick={handleChatClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={14} />
          <span className="text-xs font-medium">Chat</span>
        </motion.button>

        {/* Settings Button */}
        <motion.button
          className="flex items-center space-x-1 px-2 py-2 rounded-lg bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          style={{
            backgroundColor: personalityTheme.primary + '20',
            color: personalityTheme.text,
          }}
          onClick={handleSettingsClick}
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={14} />
        </motion.button>
      </div>

      {/* Voice Activity Visualization */}
      {voice.isListening && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
          style={{ color: personalityTheme.primary }}
          animate={{
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Personality Accent Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
        style={{ borderColor: personalityTheme.primary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.2 }}
      />

      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, ${personalityTheme.primary} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${personalityTheme.primary} 0%, transparent 50%)`,
        }}
      />
    </motion.div>
  );
};
