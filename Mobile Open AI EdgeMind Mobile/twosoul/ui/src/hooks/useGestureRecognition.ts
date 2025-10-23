import { useEffect, useCallback, useRef } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { PersonalityMode } from '@/types/personality';
import { WidgetState } from '@/types/widget';

interface GesturePoint {
  x: number;
  y: number;
  timestamp: number;
}

interface Gesture {
  id: string;
  name: string;
  pattern: GesturePoint[];
  action: () => void;
  threshold: number;
}

export const useGestureRecognition = () => {
  const {
    state,
    currentPersonality,
    setState,
    switchPersonality,
    setVisibility,
    toggleSettings,
  } = useWidgetStore();

  const gesturePoints = useRef<GesturePoint[]>([]);
  const isRecording = useRef(false);
  const gestureStartTime = useRef(0);
  const lastGestureTime = useRef(0);

  // Define gesture patterns
  const gestures: Gesture[] = [
    {
      id: 'double-tap',
      name: 'Double Tap',
      pattern: [], // Special case - handled separately
      action: () => {
        if (state === WidgetState.COLLAPSED) {
          setState(WidgetState.EXPANDED);
        } else {
          setState(WidgetState.COLLAPSED);
        }
      },
      threshold: 0.8,
    },
    {
      id: 'swipe-right',
      name: 'Swipe Right',
      pattern: [
        { x: 0, y: 0, timestamp: 0 },
        { x: 100, y: 0, timestamp: 300 },
      ],
      action: () => {
        // Cycle to next personality
        const personalities = Object.values(PersonalityMode);
        const currentIndex = personalities.indexOf(currentPersonality);
        const nextIndex = (currentIndex + 1) % personalities.length;
        switchPersonality(personalities[nextIndex]);
      },
      threshold: 0.7,
    },
    {
      id: 'swipe-left',
      name: 'Swipe Left',
      pattern: [
        { x: 100, y: 0, timestamp: 0 },
        { x: 0, y: 0, timestamp: 300 },
      ],
      action: () => {
        // Cycle to previous personality
        const personalities = Object.values(PersonalityMode);
        const currentIndex = personalities.indexOf(currentPersonality);
        const prevIndex = (currentIndex - 1 + personalities.length) % personalities.length;
        switchPersonality(personalities[prevIndex]);
      },
      threshold: 0.7,
    },
    {
      id: 'swipe-up',
      name: 'Swipe Up',
      pattern: [
        { x: 0, y: 100, timestamp: 0 },
        { x: 0, y: 0, timestamp: 300 },
      ],
      action: () => {
        setState(WidgetState.EXPANDED);
      },
      threshold: 0.7,
    },
    {
      id: 'swipe-down',
      name: 'Swipe Down',
      pattern: [
        { x: 0, y: 0, timestamp: 0 },
        { x: 0, y: 100, timestamp: 300 },
      ],
      action: () => {
        setState(WidgetState.COLLAPSED);
      },
      threshold: 0.7,
    },
    {
      id: 'circle-clockwise',
      name: 'Circle Clockwise',
      pattern: [
        { x: 0, y: 0, timestamp: 0 },
        { x: 50, y: -50, timestamp: 200 },
        { x: 100, y: 0, timestamp: 400 },
        { x: 50, y: 50, timestamp: 600 },
        { x: 0, y: 0, timestamp: 800 },
      ],
      action: () => {
        toggleSettings();
      },
      threshold: 0.6,
    },
    {
      id: 'long-press',
      name: 'Long Press',
      pattern: [], // Special case - handled separately
      action: () => {
        setVisibility(false);
      },
      threshold: 0.8,
    },
  ];

  // Calculate distance between two points
  const distance = useCallback((p1: GesturePoint, p2: GesturePoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // Normalize gesture points to a standard scale
  const normalizeGesture = useCallback((points: GesturePoint[]): GesturePoint[] => {
    if (points.length < 2) return points;

    // Find bounding box
    let minX = points[0].x, maxX = points[0].x;
    let minY = points[0].y, maxY = points[0].y;
    let minTime = points[0].timestamp, maxTime = points[0].timestamp;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
      minTime = Math.min(minTime, point.timestamp);
      maxTime = Math.max(maxTime, point.timestamp);
    }

    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const duration = maxTime - minTime || 1;

    // Normalize to 100x100 scale
    return points.map(point => ({
      x: ((point.x - minX) / width) * 100,
      y: ((point.y - minY) / height) * 100,
      timestamp: ((point.timestamp - minTime) / duration) * 1000,
    }));
  }, []);

  // Calculate similarity between two gesture patterns
  const calculateSimilarity = useCallback((
    recorded: GesturePoint[],
    pattern: GesturePoint[]
  ): number => {
    if (recorded.length === 0 || pattern.length === 0) return 0;

    const normalizedRecorded = normalizeGesture(recorded);
    const normalizedPattern = normalizeGesture(pattern);

    // Simple DTW-like algorithm for gesture matching
    const maxLength = Math.max(normalizedRecorded.length, normalizedPattern.length);
    let totalDistance = 0;
    let matchedPoints = 0;

    for (let i = 0; i < maxLength; i++) {
      const recordedIndex = Math.min(i, normalizedRecorded.length - 1);
      const patternIndex = Math.min(i, normalizedPattern.length - 1);

      const recordedPoint = normalizedRecorded[recordedIndex];
      const patternPoint = normalizedPattern[patternIndex];

      if (recordedPoint && patternPoint) {
        const dist = distance(recordedPoint, patternPoint);
        totalDistance += dist;
        matchedPoints++;
      }
    }

    if (matchedPoints === 0) return 0;

    const averageDistance = totalDistance / matchedPoints;
    const maxPossibleDistance = Math.sqrt(100 * 100 + 100 * 100); // Diagonal of 100x100 square
    
    return Math.max(0, 1 - (averageDistance / maxPossibleDistance));
  }, [normalizeGesture, distance]);

  // Recognize gesture from recorded points
  const recognizeGesture = useCallback((points: GesturePoint[]): Gesture | null => {
    if (points.length < 2) return null;

    let bestMatch: Gesture | null = null;
    let bestSimilarity = 0;

    for (const gesture of gestures) {
      if (gesture.pattern.length === 0) continue; // Skip special cases

      const similarity = calculateSimilarity(points, gesture.pattern);
      
      if (similarity > gesture.threshold && similarity > bestSimilarity) {
        bestMatch = gesture;
        bestSimilarity = similarity;
      }
    }

    return bestMatch;
  }, [gestures, calculateSimilarity]);

  // Handle double tap detection
  const handleDoubleTap = useCallback((event: MouseEvent | TouchEvent) => {
    const now = Date.now();
    const timeSinceLastGesture = now - lastGestureTime.current;

    if (timeSinceLastGesture < 300) {
      // Double tap detected
      const doubleTapGesture = gestures.find(g => g.id === 'double-tap');
      if (doubleTapGesture) {
        doubleTapGesture.action();
      }
    }

    lastGestureTime.current = now;
  }, [gestures]);

  // Handle long press detection
  const handleLongPress = useCallback((startTime: number) => {
    const longPressDuration = 1000; // 1 second
    
    setTimeout(() => {
      if (isRecording.current && Date.now() - startTime >= longPressDuration) {
        const longPressGesture = gestures.find(g => g.id === 'long-press');
        if (longPressGesture) {
          longPressGesture.action();
        }
      }
    }, longPressDuration);
  }, [gestures]);

  // Start gesture recording
  const startGestureRecording = useCallback((x: number, y: number) => {
    gesturePoints.current = [];
    isRecording.current = true;
    gestureStartTime.current = Date.now();

    gesturePoints.current.push({
      x,
      y,
      timestamp: gestureStartTime.current,
    });

    // Start long press detection
    handleLongPress(gestureStartTime.current);
  }, [handleLongPress]);

  // Add point to gesture recording
  const addGesturePoint = useCallback((x: number, y: number) => {
    if (!isRecording.current) return;

    const now = Date.now();
    gesturePoints.current.push({
      x,
      y,
      timestamp: now,
    });
  }, []);

  // End gesture recording and attempt recognition
  const endGestureRecording = useCallback(() => {
    if (!isRecording.current) return;

    isRecording.current = false;
    const duration = Date.now() - gestureStartTime.current;

    // Ignore very short gestures (likely accidental)
    if (duration < 100) return;

    // Try to recognize the gesture
    const recognizedGesture = recognizeGesture(gesturePoints.current);
    
    if (recognizedGesture) {
      console.log(`Gesture recognized: ${recognizedGesture.name}`);
      recognizedGesture.action();
    }

    gesturePoints.current = [];
  }, [recognizeGesture]);

  // Mouse event handlers
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Only handle gestures on the widget
      const target = event.target as Element;
      if (!target.closest('[data-widget-container]')) return;

      startGestureRecording(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isRecording.current) {
        addGesturePoint(event.clientX, event.clientY);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isRecording.current) {
        endGestureRecording();
        handleDoubleTap(event);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [startGestureRecording, addGesturePoint, endGestureRecording, handleDoubleTap]);

  // Touch event handlers
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-widget-container]')) return;

      const touch = event.touches[0];
      startGestureRecording(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isRecording.current && event.touches.length > 0) {
        const touch = event.touches[0];
        addGesturePoint(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (isRecording.current) {
        endGestureRecording();
        handleDoubleTap(event);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startGestureRecording, addGesturePoint, endGestureRecording, handleDoubleTap]);

  return {
    gestures,
    isRecording: isRecording.current,
    currentGesturePoints: gesturePoints.current,
    recognizeGesture,
    calculateSimilarity,
  };
};
