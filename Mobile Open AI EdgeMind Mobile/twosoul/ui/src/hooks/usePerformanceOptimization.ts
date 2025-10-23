import { useEffect, useCallback, useRef } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetState } from '@/types/widget';

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  renderTime: number;
  interactionLatency: number;
  cpuUsage: number;
}

interface OptimizationSettings {
  enableAnimations: boolean;
  reducedMotion: boolean;
  lowPowerMode: boolean;
  adaptiveQuality: boolean;
  backgroundThrottling: boolean;
}

export const usePerformanceOptimization = () => {
  const {
    state,
    context,
    preferences,
    updateContext,
  } = useWidgetStore();

  const metrics = useRef<PerformanceMetrics>({
    frameRate: 60,
    memoryUsage: 0,
    renderTime: 0,
    interactionLatency: 0,
    cpuUsage: 0,
  });

  const optimizationSettings = useRef<OptimizationSettings>({
    enableAnimations: true,
    reducedMotion: false,
    lowPowerMode: false,
    adaptiveQuality: true,
    backgroundThrottling: true,
  });

  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const animationFrame = useRef<number>();

  // Monitor frame rate
  const monitorFrameRate = useCallback(() => {
    const now = performance.now();
    frameCount.current++;

    if (now - lastFrameTime.current >= 1000) {
      metrics.current.frameRate = frameCount.current;
      frameCount.current = 0;
      lastFrameTime.current = now;

      // Adjust optimization settings based on frame rate
      if (metrics.current.frameRate < 30 && optimizationSettings.current.adaptiveQuality) {
        optimizationSettings.current.enableAnimations = false;
        optimizationSettings.current.lowPowerMode = true;
      } else if (metrics.current.frameRate > 50) {
        optimizationSettings.current.enableAnimations = true;
        optimizationSettings.current.lowPowerMode = false;
      }
    }

    animationFrame.current = requestAnimationFrame(monitorFrameRate);
  }, []);

  // Monitor memory usage
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.current.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

      // Enable memory optimization if usage is high
      if (metrics.current.memoryUsage > 0.8) {
        optimizationSettings.current.backgroundThrottling = true;
        optimizationSettings.current.lowPowerMode = true;
      }
    }
  }, []);

  // Monitor render performance
  const monitorRenderPerformance = useCallback(() => {
    if (!performanceObserver.current && 'PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'measure' && entry.name.includes('React')) {
            metrics.current.renderTime = entry.duration;
          }
          
          if (entry.entryType === 'navigation') {
            metrics.current.interactionLatency = entry.duration;
          }
        }
      });

      try {
        performanceObserver.current.observe({ 
          entryTypes: ['measure', 'navigation', 'paint'] 
        });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  }, []);

  // Optimize animations based on performance
  const optimizeAnimations = useCallback(() => {
    const widgetElement = document.querySelector('[data-widget-container]') as HTMLElement;
    if (!widgetElement) return;

    if (optimizationSettings.current.lowPowerMode) {
      // Disable complex animations
      widgetElement.style.setProperty('--animation-duration', '0.1s');
      widgetElement.style.setProperty('--animation-complexity', 'simple');
    } else if (optimizationSettings.current.enableAnimations) {
      // Enable full animations
      widgetElement.style.setProperty('--animation-duration', '0.3s');
      widgetElement.style.setProperty('--animation-complexity', 'full');
    }

    // Respect user's reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      optimizationSettings.current.reducedMotion = true;
      widgetElement.style.setProperty('--animation-duration', '0.01s');
    }
  }, []);

  // Throttle background operations
  const throttleBackgroundOperations = useCallback(() => {
    if (!optimizationSettings.current.backgroundThrottling) return;

    // Reduce update frequency when widget is not visible or user is away
    const shouldThrottle = 
      !document.hasFocus() ||
      document.hidden ||
      context.userActivity === 'away' ||
      state === WidgetState.COLLAPSED;

    if (shouldThrottle) {
      // Reduce context updates
      updateContext({ systemLoad: 'low' });
      
      // Cancel non-essential animations
      const widgetElement = document.querySelector('[data-widget-container]') as HTMLElement;
      if (widgetElement) {
        widgetElement.style.setProperty('--background-animations', 'paused');
      }
    } else {
      // Resume normal operations
      const widgetElement = document.querySelector('[data-widget-container]') as HTMLElement;
      if (widgetElement) {
        widgetElement.style.setProperty('--background-animations', 'running');
      }
    }
  }, [context.userActivity, state, updateContext]);

  // Optimize for battery life
  const optimizeForBattery = useCallback(() => {
    const batteryLevel = context.batteryLevel;
    
    if (batteryLevel !== undefined && batteryLevel < 0.2) {
      // Enable aggressive power saving
      optimizationSettings.current.lowPowerMode = true;
      optimizationSettings.current.enableAnimations = false;
      optimizationSettings.current.backgroundThrottling = true;
      
      // Reduce transparency effects (they're GPU intensive)
      const widgetElement = document.querySelector('[data-widget-container]') as HTMLElement;
      if (widgetElement) {
        widgetElement.style.setProperty('--backdrop-blur', 'none');
        widgetElement.style.setProperty('--transparency-effects', 'disabled');
      }
    } else if (batteryLevel !== undefined && batteryLevel > 0.5) {
      // Resume normal operations
      optimizationSettings.current.lowPowerMode = false;
      optimizationSettings.current.enableAnimations = true;
      
      const widgetElement = document.querySelector('[data-widget-container]') as HTMLElement;
      if (widgetElement) {
        widgetElement.style.setProperty('--backdrop-blur', 'blur(10px)');
        widgetElement.style.setProperty('--transparency-effects', 'enabled');
      }
    }
  }, [context.batteryLevel]);

  // Optimize for system load
  const optimizeForSystemLoad = useCallback(() => {
    switch (context.systemLoad) {
      case 'high':
        optimizationSettings.current.enableAnimations = false;
        optimizationSettings.current.backgroundThrottling = true;
        break;
      case 'medium':
        optimizationSettings.current.enableAnimations = preferences.animationSpeed !== 'fast';
        optimizationSettings.current.backgroundThrottling = true;
        break;
      case 'low':
        optimizationSettings.current.enableAnimations = true;
        optimizationSettings.current.backgroundThrottling = false;
        break;
    }
  }, [context.systemLoad, preferences.animationSpeed]);

  // Debounce expensive operations
  const debounceExpensiveOperations = useCallback(() => {
    const debounceMap = new Map<string, NodeJS.Timeout>();

    return (key: string, operation: () => void, delay: number = 100) => {
      if (debounceMap.has(key)) {
        clearTimeout(debounceMap.get(key)!);
      }

      const timeout = setTimeout(() => {
        operation();
        debounceMap.delete(key);
      }, delay);

      debounceMap.set(key, timeout);
    };
  }, []);

  // Lazy load non-critical features
  const lazyLoadFeatures = useCallback(() => {
    // Only load advanced features when needed
    if (state === WidgetState.EXPANDED) {
      // Load chat history, advanced animations, etc.
      import('../components/Widget/AdvancedFeatures').catch(() => {
        console.warn('Advanced features not available');
      });
    }
  }, [state]);

  // Get performance recommendations
  const getPerformanceRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];

    if (metrics.current.frameRate < 30) {
      recommendations.push('Consider disabling animations for better performance');
    }

    if (metrics.current.memoryUsage > 0.8) {
      recommendations.push('High memory usage detected - consider restarting the widget');
    }

    if (context.batteryLevel !== undefined && context.batteryLevel < 0.2) {
      recommendations.push('Low battery - power saving mode enabled');
    }

    if (context.systemLoad === 'high') {
      recommendations.push('High system load - reduced functionality enabled');
    }

    return recommendations;
  }, [context.batteryLevel, context.systemLoad]);

  // Initialize performance monitoring
  useEffect(() => {
    monitorRenderPerformance();
    monitorFrameRate();

    const memoryInterval = setInterval(monitorMemoryUsage, 5000);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      
      clearInterval(memoryInterval);
    };
  }, [monitorRenderPerformance, monitorFrameRate, monitorMemoryUsage]);

  // Apply optimizations when context changes
  useEffect(() => {
    optimizeAnimations();
    throttleBackgroundOperations();
    optimizeForBattery();
    optimizeForSystemLoad();
    lazyLoadFeatures();
  }, [
    context.userActivity,
    context.batteryLevel,
    context.systemLoad,
    state,
    optimizeAnimations,
    throttleBackgroundOperations,
    optimizeForBattery,
    optimizeForSystemLoad,
    lazyLoadFeatures,
  ]);

  // Handle visibility changes for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause non-essential operations
        optimizationSettings.current.backgroundThrottling = true;
      } else {
        // Resume operations
        optimizationSettings.current.backgroundThrottling = false;
      }
      throttleBackgroundOperations();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [throttleBackgroundOperations]);

  return {
    metrics: metrics.current,
    optimizationSettings: optimizationSettings.current,
    getPerformanceRecommendations,
    debounceExpensiveOperations: debounceExpensiveOperations(),
  };
};
