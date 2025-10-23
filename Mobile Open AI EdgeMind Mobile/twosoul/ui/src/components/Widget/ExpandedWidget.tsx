import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalityMode, PERSONALITY_PROFILES, getPersonalityTheme } from '@/types/personality';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetState } from '@/types/widget';
import { 
  Mic, 
  Send, 
  Settings, 
  Minimize2, 
  X, 
  Paperclip,
  Home,
  Calendar,
  Palette,
  MicOff
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ExpandedWidgetProps {
  personality: PersonalityMode;
  className?: string;
}

export const ExpandedWidget: React.FC<ExpandedWidgetProps> = ({ 
  personality, 
  className 
}) => {
  const {
    messages,
    isTyping,
    voice,
    setState,
    addMessage,
    setTyping,
    updateVoiceState,
    toggleSettings,
    togglePersonalitySelector,
  } = useWidgetStore();

  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personalityProfile = PERSONALITY_PROFILES[personality];
  const personalityTheme = getPersonalityTheme(personality);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle text input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addMessage({
        type: 'user',
        content: inputValue.trim(),
      });
      
      setInputValue('');
      setTyping(true);
      
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        addMessage({
          type: 'assistant',
          content: `${personalityProfile.icon} ${personalityProfile.sample_response}`,
          personality,
        });
        setTyping(false);
      }, 1500);
    }
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    const newListeningState = !voice.isListening;
    updateVoiceState({ isListening: newListeningState });
    setIsVoiceMode(newListeningState);
    
    if (newListeningState) {
      // Start voice recognition
      console.log('Starting voice recognition...');
    } else {
      // Stop voice recognition
      console.log('Stopping voice recognition...');
    }
  };

  // Quick actions
  const quickActions = [
    { id: 'family', icon: Home, label: 'Family', color: personalityTheme.primary },
    { id: 'schedule', icon: Calendar, label: 'Schedule', color: personalityTheme.primary },
    { id: 'create', icon: Palette, label: 'Create', color: personalityTheme.primary },
  ];

  return (
    <motion.div
      className={cn(
        'relative w-full h-full rounded-2xl overflow-hidden',
        'backdrop-blur-md border border-opacity-30',
        'flex flex-col',
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
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-opacity-20 bg-opacity-50"
           style={{ 
             borderColor: personalityTheme.border,
             backgroundColor: personalityTheme.primary + '10'
           }}>
        <div className="flex items-center space-x-2">
          <motion.span 
            className="text-lg cursor-pointer"
            onClick={togglePersonalitySelector}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
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
        
        <div className="flex items-center space-x-1">
          <motion.button
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            onClick={toggleSettings}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={16} style={{ color: personalityTheme.text }} />
          </motion.button>
          
          <motion.button
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            onClick={() => setState(WidgetState.COLLAPSED)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Minimize2 size={16} style={{ color: personalityTheme.text }} />
          </motion.button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={cn(
                'flex',
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={cn(
                  'max-w-[80%] px-3 py-2 rounded-2xl text-sm',
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white/80 rounded-bl-md'
                )}
                style={{
                  backgroundColor: message.type === 'user' 
                    ? personalityTheme.primary 
                    : personalityTheme.background,
                  color: message.type === 'user' 
                    ? 'white' 
                    : personalityTheme.text,
                }}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div 
              className="px-3 py-2 rounded-2xl rounded-bl-md bg-white/80"
              style={{ backgroundColor: personalityTheme.background }}
            >
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: personalityTheme.primary }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-opacity-20"
           style={{ borderColor: personalityTheme.border }}>
        <div className="flex items-center justify-center space-x-2">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
              style={{
                backgroundColor: action.color + '20',
                color: personalityTheme.text,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon size={12} />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-opacity-20"
           style={{ borderColor: personalityTheme.border }}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Voice/Text Toggle */}
          <motion.button
            type="button"
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              voice.isListening 
                ? 'bg-red-500/20 text-red-600' 
                : 'bg-opacity-20 hover:bg-opacity-30'
            )}
            style={{
              backgroundColor: voice.isListening ? undefined : personalityTheme.primary + '20',
              color: voice.isListening ? undefined : personalityTheme.text,
            }}
            onClick={handleVoiceToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {voice.isListening ? (
              <Mic size={16} className="animate-pulse" />
            ) : (
              <MicOff size={16} />
            )}
          </motion.button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message TwoSoul (${personalityProfile.name} mode)...`}
              className="w-full px-3 py-2 rounded-lg border border-opacity-30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
              style={{
                borderColor: personalityTheme.border,
                color: personalityTheme.text,
                '--tw-ring-color': personalityTheme.primary,
              } as React.CSSProperties}
              disabled={voice.isListening}
            />
            
            {/* Attach Button */}
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors"
            >
              <Paperclip size={14} style={{ color: personalityTheme.text }} />
            </button>
          </div>

          {/* Send Button */}
          <motion.button
            type="submit"
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: personalityTheme.primary,
              color: 'white',
            }}
            disabled={!inputValue.trim() || voice.isListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>

      {/* Voice Activity Indicator */}
      {voice.isListening && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
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
    </motion.div>
  );
};
