import { useEffect, useCallback } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetContext } from '@/types/widget';

export const useContextAwareness = () => {
  const { updateContext, preferences } = useWidgetStore();

  // Get time of day
  const getTimeOfDay = useCallback((): WidgetContext['timeOfDay'] => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, []);

  // Detect user activity based on mouse/keyboard events
  const getUserActivity = useCallback((): WidgetContext['userActivity'] => {
    // This would be enhanced with actual activity detection
    // For now, return a simple implementation
    return 'active';
  }, []);

  // Get system load (simplified)
  const getSystemLoad = useCallback((): WidgetContext['systemLoad'] => {
    // In a real implementation, this would check actual system metrics
    // For now, return based on memory usage estimation
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    if (memoryUsage > 100000000) return 'high'; // 100MB
    if (memoryUsage > 50000000) return 'medium'; // 50MB
    return 'low';
  }, []);

  // Get active applications (browser tabs in this case)
  const getActiveApplications = useCallback((): string[] => {
    // In a desktop app, this would enumerate actual applications
    // For web, we can only detect the current page
    return [document.title || 'Browser'];
  }, []);

  // Get screen resolution
  const getScreenResolution = useCallback(() => {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }, []);

  // Detect multi-monitor setup
  const getMultiMonitor = useCallback((): boolean => {
    // This is a simplified detection - real implementation would use Electron APIs
    return window.screen.width !== window.innerWidth || 
           window.screen.height !== window.innerHeight;
  }, []);

  // Get battery level (if available)
  const getBatteryLevel = useCallback(async (): Promise<number | undefined> => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, []);

  // Get network status
  const getNetworkStatus = useCallback((): WidgetContext['networkStatus'] => {
    if (!navigator.onLine) return 'offline';
    
    // Check connection quality (simplified)
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'limited';
      }
    }
    
    return 'online';
  }, []);

  // Update context periodically
  const updateContextData = useCallback(async () => {
    const context: Partial<WidgetContext> = {
      timeOfDay: getTimeOfDay(),
      userActivity: getUserActivity(),
      systemLoad: getSystemLoad(),
      activeApplications: getActiveApplications(),
      screenResolution: getScreenResolution(),
      multiMonitor: getMultiMonitor(),
      batteryLevel: await getBatteryLevel(),
      networkStatus: getNetworkStatus(),
    };

    updateContext(context);
  }, [
    getTimeOfDay,
    getUserActivity,
    getSystemLoad,
    getActiveApplications,
    getScreenResolution,
    getMultiMonitor,
    getBatteryLevel,
    getNetworkStatus,
    updateContext,
  ]);

  // Set up periodic context updates
  useEffect(() => {
    // Initial update
    updateContextData();

    // Update every 30 seconds
    const interval = setInterval(updateContextData, 30000);

    // Update on window events
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateContextData();
      }
    };

    const handleResize = () => {
      updateContext({
        screenResolution: getScreenResolution(),
        multiMonitor: getMultiMonitor(),
      });
    };

    const handleOnline = () => {
      updateContext({ networkStatus: 'online' });
    };

    const handleOffline = () => {
      updateContext({ networkStatus: 'offline' });
    };

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateContextData, updateContext, getScreenResolution, getMultiMonitor]);

  // Activity detection
  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    let isIdle = false;

    const resetActivityTimer = () => {
      clearTimeout(activityTimer);
      
      if (isIdle) {
        isIdle = false;
        updateContext({ userActivity: 'active' });
      }

      // Set user as idle after 5 minutes of inactivity
      activityTimer = setTimeout(() => {
        isIdle = true;
        updateContext({ userActivity: 'idle' });
      }, 5 * 60 * 1000);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimer, true);
    });

    // Initial timer
    resetActivityTimer();

    return () => {
      clearTimeout(activityTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimer, true);
      });
    };
  }, [updateContext]);

  return {
    updateContextData,
    getTimeOfDay,
    getUserActivity,
    getSystemLoad,
  };
};
