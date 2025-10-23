import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PERSONALITY_PROFILES } from '@/types/personality';
import { 
  WidgetState, 
  WidgetPosition, 
  WidgetSize, 
  WidgetPreferences, 
  ChatMessage, 
  QuickAction,
  WidgetContext,
  VoiceState,
  WidgetNotification,
  FamilyMember,
  WidgetSession,
  InteractionMode
} from '@/types/widget';
import { PersonalityMode } from '@/types/personality';

interface WidgetStore {
  // Widget State
  state: WidgetState;
  position: WidgetPosition;
  size: WidgetSize;
  isVisible: boolean;
  isDragging: boolean;
  isResizing: boolean;
  
  // Personality & Interaction
  currentPersonality: PersonalityMode;
  interactionMode: InteractionMode;
  
  // Chat & Messages
  messages: ChatMessage[];
  isTyping: boolean;
  
  // Voice State
  voice: VoiceState;
  
  // Context & Environment
  context: WidgetContext;
  
  // User & Family
  currentUser?: FamilyMember;
  familyMembers: FamilyMember[];
  
  // Preferences & Settings
  preferences: WidgetPreferences;
  
  // Quick Actions
  quickActions: QuickAction[];
  
  // Notifications
  notifications: WidgetNotification[];
  
  // Session Management
  currentSession?: WidgetSession;
  
  // UI State
  showSettings: boolean;
  showPersonalitySelector: boolean;
  showQuickActions: boolean;
  
  // Actions
  setState: (state: WidgetState) => void;
  setPosition: (position: WidgetPosition) => void;
  setSize: (size: WidgetSize) => void;
  setVisibility: (visible: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setResizing: (resizing: boolean) => void;
  
  switchPersonality: (personality: PersonalityMode) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  
  updateVoiceState: (voice: Partial<VoiceState>) => void;
  
  updateContext: (context: Partial<WidgetContext>) => void;
  
  setCurrentUser: (user: FamilyMember) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  
  updatePreferences: (preferences: Partial<WidgetPreferences>) => void;
  
  addQuickAction: (action: QuickAction) => void;
  removeQuickAction: (id: string) => void;
  executeQuickAction: (id: string) => void;
  
  addNotification: (notification: Omit<WidgetNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  startSession: (user?: FamilyMember) => void;
  endSession: () => void;
  
  toggleSettings: () => void;
  togglePersonalitySelector: () => void;
  toggleQuickActions: () => void;
  
  // Utility functions
  getPersonalityColor: () => string;
  getPersonalityIcon: () => string;
  getPersonalityAnimation: () => string;
}

const defaultPreferences: WidgetPreferences = {
  defaultPosition: { x: window.innerWidth - 80, y: 100 },
  autoHide: false,
  snapToEdges: true,
  transparencyLevel: 0.95,
  animationSpeed: 'normal',
  voiceActivation: true,
  keyboardShortcuts: true,
  notifications: true,
  alwaysOnTop: true,
};

const defaultVoiceState: VoiceState = {
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  volume: 0,
  confidence: 0,
  lastTranscript: '',
};

const defaultContext: WidgetContext = {
  timeOfDay: 'morning',
  userActivity: 'active',
  systemLoad: 'low',
  activeApplications: [],
  screenResolution: { width: window.innerWidth, height: window.innerHeight },
  multiMonitor: false,
  networkStatus: 'online',
};

export const useWidgetStore = create<WidgetStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    state: WidgetState.COLLAPSED,
    position: defaultPreferences.defaultPosition,
    size: { width: 60, height: 60 },
    isVisible: true,
    isDragging: false,
    isResizing: false,
    
    currentPersonality: PersonalityMode.ADAPTIVE,
    interactionMode: InteractionMode.VOICE_AND_TEXT,
    
    messages: [],
    isTyping: false,
    
    voice: defaultVoiceState,
    context: defaultContext,
    
    familyMembers: [],
    preferences: defaultPreferences,
    quickActions: [],
    notifications: [],
    
    showSettings: false,
    showPersonalitySelector: false,
    showQuickActions: false,
    
    // Actions
    setState: (state) => set({ state }),
    setPosition: (position) => set({ position }),
    setSize: (size) => set({ size }),
    setVisibility: (isVisible) => set({ isVisible }),
    setDragging: (isDragging) => set({ isDragging }),
    setResizing: (isResizing) => set({ isResizing }),
    
    switchPersonality: (personality) => {
      set({ currentPersonality: personality });
      
      // Add system message about personality switch
      const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
        type: 'assistant',
        content: `Switched to ${personality} mode. ${get().getPersonalityIcon()} How can I help you today?`,
        personality,
      };
      get().addMessage(message);
    },
    
    setInteractionMode: (interactionMode) => set({ interactionMode }),
    
    addMessage: (message) => {
      const newMessage: ChatMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    },
    
    clearMessages: () => set({ messages: [] }),
    setTyping: (isTyping) => set({ isTyping }),
    
    updateVoiceState: (voiceUpdate) => 
      set((state) => ({ voice: { ...state.voice, ...voiceUpdate } })),
    
    updateContext: (contextUpdate) =>
      set((state) => ({ context: { ...state.context, ...contextUpdate } })),
    
    setCurrentUser: (currentUser) => set({ currentUser }),
    
    addFamilyMember: (member) =>
      set((state) => ({ familyMembers: [...state.familyMembers, member] })),
    
    updateFamilyMember: (id, updates) =>
      set((state) => ({
        familyMembers: state.familyMembers.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        ),
      })),
    
    updatePreferences: (preferencesUpdate) =>
      set((state) => ({ preferences: { ...state.preferences, ...preferencesUpdate } })),
    
    addQuickAction: (action) =>
      set((state) => ({ quickActions: [...state.quickActions, action] })),
    
    removeQuickAction: (id) =>
      set((state) => ({
        quickActions: state.quickActions.filter((action) => action.id !== id),
      })),
    
    executeQuickAction: (id) => {
      const action = get().quickActions.find((a) => a.id === id);
      if (action) {
        action.action();
      }
    },
    
    addNotification: (notification) => {
      const newNotification: WidgetNotification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));
      
      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, notification.duration);
      }
    },
    
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
    
    clearNotifications: () => set({ notifications: [] }),
    
    startSession: (user) => {
      const session: WidgetSession = {
        id: crypto.randomUUID(),
        familyMember: user,
        startTime: new Date(),
        personality: get().currentPersonality,
        interactionMode: get().interactionMode,
        messageCount: 0,
        voiceInteractions: 0,
        quickActionsUsed: [],
        context: get().context,
      };
      set({ currentSession: session });
    },
    
    endSession: () => {
      const session = get().currentSession;
      if (session) {
        const endedSession = {
          ...session,
          endTime: new Date(),
          messageCount: get().messages.length,
        };
        // Here you would typically save the session to analytics
        console.log('Session ended:', endedSession);
      }
      set({ currentSession: undefined });
    },
    
    toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
    togglePersonalitySelector: () => 
      set((state) => ({ showPersonalitySelector: !state.showPersonalitySelector })),
    toggleQuickActions: () => 
      set((state) => ({ showQuickActions: !state.showQuickActions })),
    
    // Utility functions
    getPersonalityColor: () => {
      const personality = get().currentPersonality;
      const colorMap = {
        [PersonalityMode.SERIOUS]: 'text-serious-600',
        [PersonalityMode.GOOFY]: 'text-goofy-600',
        [PersonalityMode.CREATIVE]: 'text-creative-600',
        [PersonalityMode.ADAPTIVE]: 'text-adaptive-600',
        [PersonalityMode.PROFESSIONAL]: 'text-professional-600',
        [PersonalityMode.CASUAL]: 'text-casual-600',
      };
      return colorMap[personality];
    },
    
    getPersonalityIcon: () => {
      const personality = get().currentPersonality;
      const iconMap = {
        [PersonalityMode.SERIOUS]: '🎯',
        [PersonalityMode.GOOFY]: '🎪',
        [PersonalityMode.CREATIVE]: '✨',
        [PersonalityMode.ADAPTIVE]: '🌟',
        [PersonalityMode.PROFESSIONAL]: '💼',
        [PersonalityMode.CASUAL]: '😊',
      };
      return iconMap[personality];
    },
    
    getPersonalityAnimation: () => {
      const personality = get().currentPersonality;
      const animationMap = {
        [PersonalityMode.SERIOUS]: 'animate-steady-pulse',
        [PersonalityMode.GOOFY]: 'animate-bouncy-wiggle',
        [PersonalityMode.CREATIVE]: 'animate-flowing-gradient',
        [PersonalityMode.ADAPTIVE]: 'animate-gentle-float',
        [PersonalityMode.PROFESSIONAL]: 'animate-steady-pulse',
        [PersonalityMode.CASUAL]: 'animate-breathing',
      };
      return animationMap[personality];
    },
  }))
);
