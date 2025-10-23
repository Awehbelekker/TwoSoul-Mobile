import { useEffect } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetState } from '@/types/widget';
import { PersonalityMode } from '@/types/personality';

export const useKeyboardShortcuts = () => {
  const {
    state,
    preferences,
    setState,
    switchPersonality,
    setVisibility,
    toggleSettings,
  } = useWidgetStore();

  useEffect(() => {
    if (!preferences.keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const { ctrlKey, altKey, shiftKey, metaKey, key } = event;

      // Ctrl/Cmd + Shift + T: Toggle widget visibility
      if ((ctrlKey || metaKey) && shiftKey && key.toLowerCase() === 't') {
        event.preventDefault();
        setVisibility(!useWidgetStore.getState().isVisible);
        return;
      }

      // Ctrl/Cmd + Shift + E: Expand/Collapse widget
      if ((ctrlKey || metaKey) && shiftKey && key.toLowerCase() === 'e') {
        event.preventDefault();
        if (state === WidgetState.EXPANDED) {
          setState(WidgetState.COLLAPSED);
        } else {
          setState(WidgetState.EXPANDED);
        }
        return;
      }

      // Ctrl/Cmd + Shift + S: Toggle settings
      if ((ctrlKey || metaKey) && shiftKey && key.toLowerCase() === 's') {
        event.preventDefault();
        toggleSettings();
        return;
      }

      // Alt + Number keys: Switch personality modes
      if (altKey && !ctrlKey && !metaKey && !shiftKey) {
        const personalityMap: Record<string, PersonalityMode> = {
          '1': PersonalityMode.SERIOUS,
          '2': PersonalityMode.GOOFY,
          '3': PersonalityMode.CREATIVE,
          '4': PersonalityMode.ADAPTIVE,
          '5': PersonalityMode.PROFESSIONAL,
          '6': PersonalityMode.CASUAL,
        };

        if (personalityMap[key]) {
          event.preventDefault();
          switchPersonality(personalityMap[key]);
          return;
        }
      }

      // Escape: Collapse widget or close modals
      if (key === 'Escape') {
        event.preventDefault();
        if (state === WidgetState.EXPANDED) {
          setState(WidgetState.COLLAPSED);
        } else if (useWidgetStore.getState().showSettings) {
          toggleSettings();
        }
        return;
      }

      // Space: Quick voice activation (when widget is focused)
      if (key === ' ' && state === WidgetState.EXPANDED) {
        event.preventDefault();
        const currentVoiceState = useWidgetStore.getState().voice.isListening;
        useWidgetStore.getState().updateVoiceState({ 
          isListening: !currentVoiceState 
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state,
    preferences.keyboardShortcuts,
    setState,
    switchPersonality,
    setVisibility,
    toggleSettings,
  ]);

  // Return available shortcuts for display in help/settings
  return {
    shortcuts: [
      { keys: ['Ctrl/Cmd', 'Shift', 'T'], description: 'Toggle widget visibility' },
      { keys: ['Ctrl/Cmd', 'Shift', 'E'], description: 'Expand/Collapse widget' },
      { keys: ['Ctrl/Cmd', 'Shift', 'S'], description: 'Toggle settings' },
      { keys: ['Alt', '1-6'], description: 'Switch personality modes' },
      { keys: ['Escape'], description: 'Collapse widget or close modals' },
      { keys: ['Space'], description: 'Toggle voice activation (when expanded)' },
    ],
  };
};
