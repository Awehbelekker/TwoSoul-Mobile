import { useEffect, useCallback, useRef } from 'react';
import { useWidgetStore } from '@/stores/widgetStore';
import { SystemIntegration, WidgetContext } from '@/types/widget';

declare global {
  interface Window {
    electronAPI?: {
      getScreenInfo: () => Promise<any>;
      setClickThrough: (clickThrough: boolean) => Promise<void>;
      setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<void>;
      minimizeToTray: () => Promise<void>;
      quitApp: () => Promise<void>;
      setWidgetBounds: (bounds: { x: number; y: number; width: number; height: number }) => Promise<void>;
      onOpenSettings: (callback: () => void) => () => void;
      platform: string;
      isElectron: boolean;
      isDev: boolean;
    };
    isElectron?: boolean;
  }
}

export const useSystemIntegration = () => {
  const {
    position,
    size,
    preferences,
    updateContext,
    setPosition,
  } = useWidgetStore();

  const systemInfo = useRef<SystemIntegration | null>(null);
  const screenInfo = useRef<any>(null);

  // Detect system capabilities
  const detectSystemCapabilities = useCallback(async (): Promise<SystemIntegration> => {
    const isElectron = window.isElectron || window.electronAPI?.isElectron || false;
    const platform = window.electronAPI?.platform || 'web';

    const capabilities = {
      voiceRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      textToSpeech: 'speechSynthesis' in window,
      systemAutomation: isElectron,
      multiMonitor: isElectron,
      touchInput: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };

    const permissions = {
      notifications: Notification.permission === 'granted',
      microphone: false, // Will be checked separately
      screenCapture: isElectron,
      fileSystem: isElectron,
      automation: isElectron,
    };

    // Check microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      permissions.microphone = true;
    } catch {
      permissions.microphone = false;
    }

    return {
      osType: platform as 'windows' | 'macos' | 'linux',
      version: navigator.userAgent,
      permissions,
      capabilities,
    };
  }, []);

  // Get multi-monitor information
  const getScreenInfo = useCallback(async () => {
    if (window.electronAPI?.getScreenInfo) {
      try {
        const info = await window.electronAPI.getScreenInfo();
        screenInfo.current = info;
        
        // Update context with multi-monitor info
        updateContext({
          multiMonitor: info.displays.length > 1,
          screenResolution: {
            width: info.primary.bounds.width,
            height: info.primary.bounds.height,
          },
        });

        return info;
      } catch (error) {
        console.warn('Failed to get screen info:', error);
      }
    }

    // Fallback for web
    return {
      displays: [{
        id: 0,
        bounds: { x: 0, y: 0, width: window.screen.width, height: window.screen.height },
        workArea: { x: 0, y: 0, width: window.screen.availWidth, height: window.screen.availHeight },
        scaleFactor: window.devicePixelRatio,
        isPrimary: true,
      }],
      primary: {
        id: 0,
        bounds: { x: 0, y: 0, width: window.screen.width, height: window.screen.height },
        workArea: { x: 0, y: 0, width: window.screen.availWidth, height: window.screen.availHeight },
        scaleFactor: window.devicePixelRatio,
      },
    };
  }, [updateContext]);

  // Set widget bounds for click-through optimization
  const updateWidgetBounds = useCallback(async () => {
    if (window.electronAPI?.setWidgetBounds) {
      try {
        await window.electronAPI.setWidgetBounds({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        });
      } catch (error) {
        console.warn('Failed to update widget bounds:', error);
      }
    }
  }, [position, size]);

  // Handle always on top preference
  const updateAlwaysOnTop = useCallback(async (alwaysOnTop: boolean) => {
    if (window.electronAPI?.setAlwaysOnTop) {
      try {
        await window.electronAPI.setAlwaysOnTop(alwaysOnTop);
      } catch (error) {
        console.warn('Failed to set always on top:', error);
      }
    }
  }, []);

  // Handle click-through when widget is collapsed
  const updateClickThrough = useCallback(async (clickThrough: boolean) => {
    if (window.electronAPI?.setClickThrough) {
      try {
        await window.electronAPI.setClickThrough(clickThrough);
      } catch (error) {
        console.warn('Failed to set click through:', error);
      }
    }
  }, []);

  // Request system permissions
  const requestPermissions = useCallback(async () => {
    const permissions: Partial<SystemIntegration['permissions']> = {};

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        permissions.notifications = permission === 'granted';
      } catch (error) {
        console.warn('Failed to request notification permission:', error);
        permissions.notifications = false;
      }
    }

    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      permissions.microphone = true;
    } catch (error) {
      console.warn('Microphone permission denied:', error);
      permissions.microphone = false;
    }

    return permissions;
  }, []);

  // Optimize widget position for multi-monitor setup
  const optimizeForMultiMonitor = useCallback(() => {
    if (!screenInfo.current || screenInfo.current.displays.length <= 1) return;

    const currentDisplay = screenInfo.current.displays.find((display: any) => {
      const bounds = display.bounds;
      return (
        position.x >= bounds.x &&
        position.x < bounds.x + bounds.width &&
        position.y >= bounds.y &&
        position.y < bounds.y + bounds.height
      );
    });

    if (!currentDisplay) {
      // Widget is outside all displays, move to primary
      const primary = screenInfo.current.primary;
      const newPosition = {
        x: primary.workArea.x + primary.workArea.width - size.width - 20,
        y: primary.workArea.y + 20,
      };
      setPosition(newPosition);
    }
  }, [position, size, setPosition]);

  // Handle system events
  const handleSystemEvents = useCallback(() => {
    // Handle display changes
    const handleDisplayChange = () => {
      getScreenInfo().then(() => {
        optimizeForMultiMonitor();
      });
    };

    // Handle power events
    const handlePowerChange = (event: Event) => {
      const batteryEvent = event as any;
      if (batteryEvent.target?.level !== undefined) {
        updateContext({ batteryLevel: batteryEvent.target.level });
      }
    };

    // Handle network changes
    const handleNetworkChange = () => {
      updateContext({
        networkStatus: navigator.onLine ? 'online' : 'offline',
      });
    };

    // Add event listeners
    window.addEventListener('resize', handleDisplayChange);
    window.addEventListener('orientationchange', handleDisplayChange);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', handlePowerChange);
        battery.addEventListener('chargingchange', handlePowerChange);
        
        // Initial battery level
        updateContext({ batteryLevel: battery.level });
      });
    }

    return () => {
      window.removeEventListener('resize', handleDisplayChange);
      window.removeEventListener('orientationchange', handleDisplayChange);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [getScreenInfo, optimizeForMultiMonitor, updateContext]);

  // Initialize system integration
  useEffect(() => {
    const initialize = async () => {
      try {
        // Detect system capabilities
        systemInfo.current = await detectSystemCapabilities();
        
        // Get screen information
        await getScreenInfo();
        
        // Request necessary permissions
        await requestPermissions();
        
        // Set up system event handlers
        const cleanup = handleSystemEvents();
        
        // Update always on top setting
        if (preferences.alwaysOnTop) {
          await updateAlwaysOnTop(true);
        }

        return cleanup;
      } catch (error) {
        console.error('Failed to initialize system integration:', error);
      }
    };

    initialize();
  }, [
    detectSystemCapabilities,
    getScreenInfo,
    requestPermissions,
    handleSystemEvents,
    preferences.alwaysOnTop,
    updateAlwaysOnTop,
  ]);

  // Update widget bounds when position/size changes
  useEffect(() => {
    updateWidgetBounds();
  }, [position, size, updateWidgetBounds]);

  // Update always on top when preference changes
  useEffect(() => {
    updateAlwaysOnTop(preferences.alwaysOnTop);
  }, [preferences.alwaysOnTop, updateAlwaysOnTop]);

  // Handle Electron-specific settings integration
  useEffect(() => {
    if (window.electronAPI?.onOpenSettings) {
      const cleanup = window.electronAPI.onOpenSettings(() => {
        useWidgetStore.getState().toggleSettings();
      });

      return cleanup;
    }
  }, []);

  return {
    systemInfo: systemInfo.current,
    screenInfo: screenInfo.current,
    updateWidgetBounds,
    updateAlwaysOnTop,
    updateClickThrough,
    requestPermissions,
    optimizeForMultiMonitor,
    getScreenInfo,
  };
};
