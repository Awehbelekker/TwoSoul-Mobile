import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetState } from '@/types/widget';
import { PersonalityMode, PERSONALITY_PROFILES, getPersonalityTheme } from '@/types/personality';
import { CollapsedWidget } from './CollapsedWidget';
import { HoverWidget } from './HoverWidget';
import { ExpandedWidget } from './ExpandedWidget';
import { useSmartPositioning } from '@/hooks/useSmartPositioning';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import { useAdaptiveTransparency } from '@/hooks/useAdaptiveTransparency';
import { cn } from '@/utils/cn';

interface FloatingWidgetProps {
  className?: string;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({ className }) => {
  const {
    state,
    position,
    size,
    isVisible,
    isDragging,
    currentPersonality,
    preferences,
    setState,
    setPosition,
    setDragging,
  } = useWidgetStore();

  const widgetRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const personalityProfile = PERSONALITY_PROFILES[currentPersonality];
  const personalityTheme = getPersonalityTheme(currentPersonality);

  // Initialize organic behavior hooks
  const { snapToEdge, performSmartRepositioning } = useSmartPositioning();
  const { isRecording } = useGestureRecognition();
  const { currentOpacity, updateOpacity } = useAdaptiveTransparency();

  // Handle drag constraints
  const dragConstraints = {
    left: 0,
    right: window.innerWidth - size.width,
    top: 0,
    bottom: window.innerHeight - size.height,
  };

  // Handle drag start
  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: info.point.x - rect.left,
        y: info.point.y - rect.top,
      });
    }
  };

  // Handle drag
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newPosition = {
      x: info.point.x - dragOffset.x,
      y: info.point.y - dragOffset.y,
    };
    
    // Apply constraints
    newPosition.x = Math.max(0, Math.min(newPosition.x, window.innerWidth - size.width));
    newPosition.y = Math.max(0, Math.min(newPosition.y, window.innerHeight - size.height));
    
    setPosition(newPosition);
  };

  // Handle drag end
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragging(false);

    // Use smart positioning for edge snapping
    const snappedPosition = snapToEdge(position);
    if (snappedPosition.x !== position.x || snappedPosition.y !== position.y) {
      setPosition(snappedPosition);
    }

    // Trigger smart repositioning after a delay
    setTimeout(() => {
      performSmartRepositioning();
    }, 1000);
  };

  // Handle mouse enter/leave for hover state
  const handleMouseEnter = () => {
    if (state === WidgetState.COLLAPSED) {
      setIsHovered(true);
      setState(WidgetState.HOVER);
    }
  };

  const handleMouseLeave = () => {
    if (state === WidgetState.HOVER) {
      setIsHovered(false);
      setState(WidgetState.COLLAPSED);
    }
  };

  // Handle click to expand
  const handleClick = () => {
    if (state === WidgetState.COLLAPSED || state === WidgetState.HOVER) {
      setState(WidgetState.EXPANDED);
    }
  };

  // Handle escape key to collapse
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state === WidgetState.EXPANDED) {
        setState(WidgetState.COLLAPSED);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, setState]);

  // Update size based on state
  useEffect(() => {
    const newSize = {
      [WidgetState.COLLAPSED]: { width: 60, height: 60 },
      [WidgetState.HOVER]: { width: 280, height: 120 },
      [WidgetState.EXPANDED]: { width: 400, height: 300 },
      [WidgetState.MINIMIZED]: { width: 40, height: 40 },
      [WidgetState.HIDDEN]: { width: 0, height: 0 },
    }[state];

    useWidgetStore.getState().setSize(newSize);
  }, [state]);

  // Widget variants for animations
  const widgetVariants = {
    collapsed: {
      width: 60,
      height: 60,
      borderRadius: 30,
      scale: 1,
      opacity: preferences.transparencyLevel,
    },
    hover: {
      width: 280,
      height: 120,
      borderRadius: 16,
      scale: 1.02,
      opacity: 1,
    },
    expanded: {
      width: 400,
      height: 300,
      borderRadius: 16,
      scale: 1,
      opacity: 1,
    },
    hidden: {
      scale: 0,
      opacity: 0,
    },
  };

  // Personality-based styling
  const personalityStyles = {
    backgroundColor: personalityTheme.background,
    borderColor: personalityTheme.border,
    boxShadow: personalityTheme.shadow,
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={widgetRef}
        data-widget-container
        className={cn(
          'fixed z-50 cursor-pointer select-none',
          'backdrop-blur-md border border-opacity-30',
          'transition-all duration-300 ease-out',
          personalityProfile.fontFamily,
          personalityProfile.animationClass,
          isDragging && 'cursor-grabbing',
          isRecording && 'ring-2 ring-blue-400 ring-opacity-50',
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          opacity: currentOpacity,
          ...personalityStyles,
        }}
        variants={widgetVariants}
        initial="collapsed"
        animate={state}
        exit="hidden"
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileHover={{ scale: state === WidgetState.COLLAPSED ? 1.05 : 1 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Widget Content Based on State */}
        <AnimatePresence mode="wait">
          {state === WidgetState.COLLAPSED && (
            <CollapsedWidget key="collapsed" personality={currentPersonality} />
          )}
          
          {state === WidgetState.HOVER && (
            <HoverWidget key="hover" personality={currentPersonality} />
          )}
          
          {state === WidgetState.EXPANDED && (
            <ExpandedWidget key="expanded" personality={currentPersonality} />
          )}
        </AnimatePresence>

        {/* Drag Handle (invisible but functional) */}
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ zIndex: -1 }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
