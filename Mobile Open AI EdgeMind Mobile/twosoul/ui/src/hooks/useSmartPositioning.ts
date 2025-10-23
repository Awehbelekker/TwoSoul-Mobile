import { useEffect, useCallback, useRef } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetPosition, WidgetSize } from '@/types/widget';

interface ObstacleRect {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'window' | 'element' | 'cursor';
  priority: number;
}

export const useSmartPositioning = () => {
  const {
    position,
    size,
    preferences,
    context,
    setPosition,
    isDragging,
  } = useWidgetStore();

  const positioningTimer = useRef<NodeJS.Timeout>();
  const lastCursorPosition = useRef({ x: 0, y: 0 });
  const obstacles = useRef<ObstacleRect[]>([]);

  // Detect obstacles (windows, elements, cursor)
  const detectObstacles = useCallback((): ObstacleRect[] => {
    const detectedObstacles: ObstacleRect[] = [];

    // Add cursor as obstacle with buffer zone
    const cursorBuffer = 100;
    detectedObstacles.push({
      x: lastCursorPosition.current.x - cursorBuffer,
      y: lastCursorPosition.current.y - cursorBuffer,
      width: cursorBuffer * 2,
      height: cursorBuffer * 2,
      type: 'cursor',
      priority: 1,
    });

    // Detect other UI elements that might be obstacles
    const importantElements = document.querySelectorAll('[data-widget-obstacle]');
    importantElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      detectedObstacles.push({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        type: 'element',
        priority: 2,
      });
    });

    // Add screen edges as preferred zones (not obstacles, but preferred positions)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const edgeBuffer = 20;

    // Preferred edge zones
    const preferredZones = [
      // Top-right corner
      { x: screenWidth - size.width - edgeBuffer, y: edgeBuffer, score: 10 },
      // Top-left corner
      { x: edgeBuffer, y: edgeBuffer, score: 9 },
      // Bottom-right corner
      { x: screenWidth - size.width - edgeBuffer, y: screenHeight - size.height - edgeBuffer, score: 8 },
      // Bottom-left corner
      { x: edgeBuffer, y: screenHeight - size.height - edgeBuffer, score: 7 },
      // Right edge center
      { x: screenWidth - size.width - edgeBuffer, y: (screenHeight - size.height) / 2, score: 6 },
      // Left edge center
      { x: edgeBuffer, y: (screenHeight - size.height) / 2, score: 5 },
    ];

    return detectedObstacles;
  }, [size]);

  // Calculate optimal position avoiding obstacles
  const calculateOptimalPosition = useCallback((
    currentPos: WidgetPosition,
    targetPos?: WidgetPosition
  ): WidgetPosition => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const edgeBuffer = 10;

    // If no target position, use current position
    const target = targetPos || currentPos;

    // Check if target position conflicts with obstacles
    const widgetRect = {
      x: target.x,
      y: target.y,
      width: size.width,
      height: size.height,
    };

    const currentObstacles = detectObstacles();
    let hasConflict = false;

    for (const obstacle of currentObstacles) {
      if (
        widgetRect.x < obstacle.x + obstacle.width &&
        widgetRect.x + widgetRect.width > obstacle.x &&
        widgetRect.y < obstacle.y + obstacle.height &&
        widgetRect.y + widgetRect.height > obstacle.y
      ) {
        hasConflict = true;
        break;
      }
    }

    // If no conflict, return target position
    if (!hasConflict) {
      return {
        x: Math.max(edgeBuffer, Math.min(target.x, screenWidth - size.width - edgeBuffer)),
        y: Math.max(edgeBuffer, Math.min(target.y, screenHeight - size.height - edgeBuffer)),
      };
    }

    // Find alternative position
    const alternatives: Array<{ position: WidgetPosition; score: number }> = [];

    // Try edge positions
    const edgePositions = [
      // Corners (highest priority)
      { x: screenWidth - size.width - edgeBuffer, y: edgeBuffer, score: 10 },
      { x: edgeBuffer, y: edgeBuffer, score: 9 },
      { x: screenWidth - size.width - edgeBuffer, y: screenHeight - size.height - edgeBuffer, score: 8 },
      { x: edgeBuffer, y: screenHeight - size.height - edgeBuffer, score: 7 },
      
      // Edge centers
      { x: screenWidth - size.width - edgeBuffer, y: (screenHeight - size.height) / 2, score: 6 },
      { x: edgeBuffer, y: (screenHeight - size.height) / 2, score: 5 },
      { x: (screenWidth - size.width) / 2, y: edgeBuffer, score: 4 },
      { x: (screenWidth - size.width) / 2, y: screenHeight - size.height - edgeBuffer, score: 3 },
    ];

    for (const pos of edgePositions) {
      const testRect = {
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
      };

      let hasConflictHere = false;
      for (const obstacle of currentObstacles) {
        if (
          testRect.x < obstacle.x + obstacle.width &&
          testRect.x + testRect.width > obstacle.x &&
          testRect.y < obstacle.y + obstacle.height &&
          testRect.y + testRect.height > obstacle.y
        ) {
          hasConflictHere = true;
          break;
        }
      }

      if (!hasConflictHere) {
        alternatives.push({
          position: { x: pos.x, y: pos.y },
          score: pos.score,
        });
      }
    }

    // Return best alternative or fallback to safe position
    if (alternatives.length > 0) {
      alternatives.sort((a, b) => b.score - a.score);
      return alternatives[0].position;
    }

    // Fallback to top-right corner
    return {
      x: screenWidth - size.width - edgeBuffer,
      y: edgeBuffer,
    };
  }, [size, detectObstacles]);

  // Smart repositioning when obstacles are detected
  const performSmartRepositioning = useCallback(() => {
    if (isDragging) return; // Don't reposition while user is dragging

    const optimalPosition = calculateOptimalPosition(position);
    
    // Only move if the new position is significantly different
    const threshold = 20;
    const distance = Math.sqrt(
      Math.pow(optimalPosition.x - position.x, 2) + 
      Math.pow(optimalPosition.y - position.y, 2)
    );

    if (distance > threshold) {
      setPosition(optimalPosition);
    }
  }, [position, calculateOptimalPosition, isDragging, setPosition]);

  // Track cursor position for avoidance
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      lastCursorPosition.current = { x: event.clientX, y: event.clientY };
      
      // Debounce repositioning
      if (positioningTimer.current) {
        clearTimeout(positioningTimer.current);
      }
      
      positioningTimer.current = setTimeout(() => {
        if (preferences.snapToEdges) {
          performSmartRepositioning();
        }
      }, 500); // Wait 500ms after cursor stops moving
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (positioningTimer.current) {
        clearTimeout(positioningTimer.current);
      }
    };
  }, [performSmartRepositioning, preferences.snapToEdges]);

  // Reposition on window resize
  useEffect(() => {
    const handleResize = () => {
      // Ensure widget stays within bounds
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const edgeBuffer = 10;

      const newPosition = {
        x: Math.max(edgeBuffer, Math.min(position.x, screenWidth - size.width - edgeBuffer)),
        y: Math.max(edgeBuffer, Math.min(position.y, screenHeight - size.height - edgeBuffer)),
      };

      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        setPosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, size, setPosition]);

  // Reposition based on context changes
  useEffect(() => {
    if (!preferences.snapToEdges) return;

    // Reposition based on time of day
    if (context.timeOfDay === 'night') {
      // Move to less prominent position at night
      const nightPosition = calculateOptimalPosition(position, {
        x: window.innerWidth - size.width - 20,
        y: window.innerHeight - size.height - 20,
      });
      setPosition(nightPosition);
    }
  }, [context.timeOfDay, preferences.snapToEdges, calculateOptimalPosition, position, size, setPosition]);

  // Snap to edges when dragging ends
  const snapToEdge = useCallback((currentPosition: WidgetPosition): WidgetPosition => {
    if (!preferences.snapToEdges) return currentPosition;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const snapThreshold = 50;
    const edgeBuffer = 10;

    let newPosition = { ...currentPosition };

    // Snap to left or right edge
    if (currentPosition.x < snapThreshold) {
      newPosition.x = edgeBuffer;
    } else if (currentPosition.x > screenWidth - size.width - snapThreshold) {
      newPosition.x = screenWidth - size.width - edgeBuffer;
    }

    // Snap to top or bottom edge
    if (currentPosition.y < snapThreshold) {
      newPosition.y = edgeBuffer;
    } else if (currentPosition.y > screenHeight - size.height - snapThreshold) {
      newPosition.y = screenHeight - size.height - edgeBuffer;
    }

    return newPosition;
  }, [preferences.snapToEdges, size]);

  return {
    calculateOptimalPosition,
    performSmartRepositioning,
    snapToEdge,
    detectObstacles,
  };
};
