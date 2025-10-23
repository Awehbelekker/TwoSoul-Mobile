import { useEffect, useCallback, useRef } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetState } from '@/types/widget';

interface TransparencyRule {
  condition: () => boolean;
  opacity: number;
  priority: number;
  name: string;
}

export const useAdaptiveTransparency = () => {
  const {
    state,
    position,
    size,
    context,
    preferences,
    voice,
    isVisible,
  } = useWidgetStore();

  const currentOpacity = useRef(1);
  const animationFrame = useRef<number>();
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const mouseIdleTimer = useRef<NodeJS.Timeout>();
  const isMouseIdle = useRef(false);

  // Define transparency rules with priorities
  const transparencyRules: TransparencyRule[] = [
    // Highest priority: User interaction
    {
      condition: () => state === WidgetState.EXPANDED,
      opacity: 1,
      priority: 10,
      name: 'expanded-state',
    },
    {
      condition: () => state === WidgetState.HOVER,
      opacity: 0.95,
      priority: 9,
      name: 'hover-state',
    },
    {
      condition: () => voice.isListening || voice.isProcessing || voice.isSpeaking,
      opacity: 1,
      priority: 8,
      name: 'voice-active',
    },

    // Medium priority: Context awareness
    {
      condition: () => context.userActivity === 'idle',
      opacity: 0.3,
      priority: 7,
      name: 'user-idle',
    },
    {
      condition: () => context.userActivity === 'away',
      opacity: 0.2,
      priority: 6,
      name: 'user-away',
    },
    {
      condition: () => context.timeOfDay === 'night',
      opacity: 0.6,
      priority: 5,
      name: 'night-time',
    },
    {
      condition: () => isMouseNearWidget(),
      opacity: 0.4,
      priority: 4,
      name: 'mouse-proximity',
    },

    // Lower priority: System state
    {
      condition: () => context.systemLoad === 'high',
      opacity: 0.5,
      priority: 3,
      name: 'high-system-load',
    },
    {
      condition: () => context.batteryLevel !== undefined && context.batteryLevel < 0.2,
      opacity: 0.4,
      priority: 2,
      name: 'low-battery',
    },

    // Lowest priority: Default states
    {
      condition: () => state === WidgetState.COLLAPSED && isMouseIdle.current,
      opacity: preferences.transparencyLevel * 0.7,
      priority: 1,
      name: 'collapsed-idle',
    },
    {
      condition: () => state === WidgetState.COLLAPSED,
      opacity: preferences.transparencyLevel,
      priority: 0,
      name: 'collapsed-default',
    },
  ];

  // Check if mouse is near the widget
  const isMouseNearWidget = useCallback((): boolean => {
    const mouseX = lastMousePosition.current.x;
    const mouseY = lastMousePosition.current.y;
    const proximityThreshold = 100;

    const widgetBounds = {
      left: position.x,
      right: position.x + size.width,
      top: position.y,
      bottom: position.y + size.height,
    };

    return (
      mouseX >= widgetBounds.left - proximityThreshold &&
      mouseX <= widgetBounds.right + proximityThreshold &&
      mouseY >= widgetBounds.top - proximityThreshold &&
      mouseY <= widgetBounds.bottom + proximityThreshold
    );
  }, [position, size]);

  // Calculate optimal opacity based on rules
  const calculateOptimalOpacity = useCallback((): number => {
    if (!isVisible) return 0;

    // Find the highest priority rule that matches
    const applicableRules = transparencyRules
      .filter(rule => rule.condition())
      .sort((a, b) => b.priority - a.priority);

    if (applicableRules.length > 0) {
      const topRule = applicableRules[0];
      console.log(`Transparency rule applied: ${topRule.name} (opacity: ${topRule.opacity})`);
      return topRule.opacity;
    }

    // Fallback to default transparency
    return preferences.transparencyLevel;
  }, [isVisible, transparencyRules, preferences.transparencyLevel]);

  // Smooth opacity transition
  const animateOpacity = useCallback((targetOpacity: number) => {
    const startOpacity = currentOpacity.current;
    const startTime = performance.now();
    const duration = 300; // 300ms transition

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newOpacity = startOpacity + (targetOpacity - startOpacity) * easeOut;
      currentOpacity.current = newOpacity;

      // Apply opacity to widget element
      const widgetElement = document.querySelector('[data-widget-container]') as HTMLElement;
      if (widgetElement) {
        widgetElement.style.opacity = newOpacity.toString();
      }

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(animate);
  }, []);

  // Update opacity based on current conditions
  const updateOpacity = useCallback(() => {
    const targetOpacity = calculateOptimalOpacity();
    
    if (Math.abs(targetOpacity - currentOpacity.current) > 0.05) {
      animateOpacity(targetOpacity);
    }
  }, [calculateOptimalOpacity, animateOpacity]);

  // Track mouse movement for proximity detection
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      
      // Reset mouse idle state
      isMouseIdle.current = false;
      
      if (mouseIdleTimer.current) {
        clearTimeout(mouseIdleTimer.current);
      }
      
      // Set mouse as idle after 3 seconds of no movement
      mouseIdleTimer.current = setTimeout(() => {
        isMouseIdle.current = true;
        updateOpacity();
      }, 3000);

      // Update opacity immediately for proximity changes
      updateOpacity();
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseIdleTimer.current) {
        clearTimeout(mouseIdleTimer.current);
      }
    };
  }, [updateOpacity]);

  // Update opacity when dependencies change
  useEffect(() => {
    updateOpacity();
  }, [
    state,
    context.userActivity,
    context.timeOfDay,
    context.systemLoad,
    context.batteryLevel,
    voice.isListening,
    voice.isProcessing,
    voice.isSpeaking,
    preferences.transparencyLevel,
    isVisible,
    updateOpacity,
  ]);

  // Handle window focus/blur for better context awareness
  useEffect(() => {
    const handleFocus = () => {
      // Window gained focus - user is active
      updateOpacity();
    };

    const handleBlur = () => {
      // Window lost focus - user might be away
      updateOpacity();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [updateOpacity]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      updateOpacity();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateOpacity]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Manual opacity control functions
  const setOpacity = useCallback((opacity: number) => {
    animateOpacity(Math.max(0, Math.min(1, opacity)));
  }, [animateOpacity]);

  const fadeIn = useCallback(() => {
    animateOpacity(1);
  }, [animateOpacity]);

  const fadeOut = useCallback(() => {
    animateOpacity(0);
  }, [animateOpacity]);

  const resetOpacity = useCallback(() => {
    updateOpacity();
  }, [updateOpacity]);

  return {
    currentOpacity: currentOpacity.current,
    setOpacity,
    fadeIn,
    fadeOut,
    resetOpacity,
    updateOpacity,
    transparencyRules,
    isMouseNearWidget,
  };
};
