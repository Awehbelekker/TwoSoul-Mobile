import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '@/stores/widgetStore';
import { PersonalityMode, PERSONALITY_PROFILES } from '@/types/personality';
import { InteractionMode } from '@/types/widget';
import { 
  Settings, 
  X, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Smartphone, 
  Palette,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    currentPersonality,
    interactionMode,
    preferences,
    familyMembers,
    switchPersonality,
    setInteractionMode,
    updatePreferences,
  } = useWidgetStore();

  const [activeTab, setActiveTab] = useState<'general' | 'personality' | 'privacy' | 'performance'>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'personality', label: 'Personality', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Zap },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-4xl h-[80vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <h2 className="text-2xl font-semibold text-gray-800">TwoSoul Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50/50 border-r border-gray-200/50 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'hover:bg-gray-100/50 text-gray-700'
                    )}
                  >
                    <tab.icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">General Settings</h3>
                    
                    {/* Interaction Mode */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Interaction Mode</label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.values(InteractionMode).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setInteractionMode(mode)}
                            className={cn(
                              'p-3 rounded-lg border-2 transition-all duration-200',
                              interactionMode === mode
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="flex items-center justify-center mb-2">
                              {mode === InteractionMode.VOICE_ONLY && <Volume2 size={20} />}
                              {mode === InteractionMode.TEXT_ONLY && <Monitor size={20} />}
                              {mode === InteractionMode.VOICE_AND_TEXT && <Smartphone size={20} />}
                            </div>
                            <div className="text-xs font-medium">
                              {mode.replace('_', ' & ').replace('_', ' ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Widget Behavior */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Widget Behavior</h4>
                      
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Always on top</span>
                          <input
                            type="checkbox"
                            checked={preferences.alwaysOnTop}
                            onChange={(e) => updatePreferences({ alwaysOnTop: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Snap to edges</span>
                          <input
                            type="checkbox"
                            checked={preferences.snapToEdges}
                            onChange={(e) => updatePreferences({ snapToEdges: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Auto-hide when idle</span>
                          <input
                            type="checkbox"
                            checked={preferences.autoHide}
                            onChange={(e) => updatePreferences({ autoHide: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Voice activation</span>
                          <input
                            type="checkbox"
                            checked={preferences.voiceActivation}
                            onChange={(e) => updatePreferences({ voiceActivation: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Keyboard shortcuts</span>
                          <input
                            type="checkbox"
                            checked={preferences.keyboardShortcuts}
                            onChange={(e) => updatePreferences({ keyboardShortcuts: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Transparency */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Transparency Level: {Math.round(preferences.transparencyLevel * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={preferences.transparencyLevel}
                        onChange={(e) => updatePreferences({ transparencyLevel: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Animation Speed */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Animation Speed</label>
                      <select
                        value={preferences.animationSpeed}
                        onChange={(e) => updatePreferences({ animationSpeed: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'personality' && (
                  <motion.div
                    key="personality"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Personality Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {Object.values(PersonalityMode).map((mode) => {
                        const profile = PERSONALITY_PROFILES[mode];
                        return (
                          <button
                            key={mode}
                            onClick={() => switchPersonality(mode)}
                            className={cn(
                              'p-4 rounded-xl border-2 text-left transition-all duration-200',
                              currentPersonality === mode
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{profile.icon}</span>
                              <div>
                                <h4 className="font-semibold text-gray-800">{profile.name}</h4>
                                <p className="text-xs text-gray-600">{profile.tone_description}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{profile.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Privacy & Security</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Info className="text-blue-500 mt-0.5" size={16} />
                          <div>
                            <h4 className="font-medium text-blue-800">Data Privacy</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              TwoSoul processes your data locally and only shares what you explicitly allow.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800">Data Collection</h4>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Analytics & Usage Data</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Voice Recordings</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Conversation History</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'performance' && (
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800">Optimization</h4>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Adaptive Quality</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Background Throttling</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Power Saving Mode</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
