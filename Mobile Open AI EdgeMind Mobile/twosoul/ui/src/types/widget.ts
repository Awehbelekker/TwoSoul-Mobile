import { PersonalityMode } from './personality';

export enum WidgetState {
  COLLAPSED = 'collapsed',
  HOVER = 'hover',
  EXPANDED = 'expanded',
  MINIMIZED = 'minimized',
  HIDDEN = 'hidden'
}

export enum InteractionMode {
  VOICE_ONLY = 'voice_only',
  TEXT_ONLY = 'text_only',
  VOICE_AND_TEXT = 'voice_and_text'
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetBounds {
  position: WidgetPosition;
  size: WidgetSize;
}

export interface WidgetPreferences {
  defaultPosition: WidgetPosition;
  autoHide: boolean;
  snapToEdges: boolean;
  transparencyLevel: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  voiceActivation: boolean;
  keyboardShortcuts: boolean;
  notifications: boolean;
  alwaysOnTop: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  personality?: PersonalityMode;
  metadata?: {
    voiceInput?: boolean;
    confidence?: number;
    processingTime?: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  personality?: PersonalityMode;
  category: 'family' | 'schedule' | 'creative' | 'automation' | 'settings';
}

export interface WidgetContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userActivity: 'active' | 'idle' | 'away' | 'busy';
  systemLoad: 'low' | 'medium' | 'high';
  activeApplications: string[];
  screenResolution: { width: number; height: number };
  multiMonitor: boolean;
  batteryLevel?: number;
  networkStatus: 'online' | 'offline' | 'limited';
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  volume: number;
  confidence: number;
  lastTranscript: string;
}

export interface WidgetAnalytics {
  totalInteractions: number;
  averageSessionLength: number;
  mostUsedPersonality: PersonalityMode;
  preferredInteractionMode: InteractionMode;
  quickActionUsage: Record<string, number>;
  errorRate: number;
  userSatisfaction: number;
}

export interface SystemIntegration {
  osType: 'windows' | 'macos' | 'linux';
  version: string;
  permissions: {
    notifications: boolean;
    microphone: boolean;
    screenCapture: boolean;
    fileSystem: boolean;
    automation: boolean;
  };
  capabilities: {
    voiceRecognition: boolean;
    textToSpeech: boolean;
    systemAutomation: boolean;
    multiMonitor: boolean;
    touchInput: boolean;
  };
}

export interface WidgetError {
  id: string;
  type: 'connection' | 'voice' | 'ui' | 'system' | 'unknown';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  resolved: boolean;
}

export interface WidgetNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  personality?: PersonalityMode;
  timestamp: Date;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'guardian' | 'other';
  age?: number;
  preferences: {
    personality: PersonalityMode;
    interactionMode: InteractionMode;
    voiceEnabled: boolean;
    safetyLevel: 'strict' | 'moderate' | 'relaxed';
  };
  avatar?: string;
  isActive: boolean;
}

export interface WidgetSession {
  id: string;
  userId?: string;
  familyMember?: FamilyMember;
  startTime: Date;
  endTime?: Date;
  personality: PersonalityMode;
  interactionMode: InteractionMode;
  messageCount: number;
  voiceInteractions: number;
  quickActionsUsed: string[];
  satisfaction?: number;
  context: WidgetContext;
}
