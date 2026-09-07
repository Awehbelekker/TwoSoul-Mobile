/**
 * TypeScript types for Universal Soul AI API
 */

export type PersonalityMode = 'serious' | 'goofy' | 'creative' | 'adaptive' | 'professional' | 'casual';

export interface ChatRequest {
  message: string;
  user_id?: string;
  personality_mode: PersonalityMode;
  context?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  user_id: string;
  personality_mode: string;
  timestamp: string;
  processing_time: number;
}

export interface SystemStatus {
  status: string;
  system_initialized: boolean;
  active_sessions: number;
  total_requests: number;
  uptime_seconds: number;
}

export interface PersonalityInfo {
  mode: string;
  description: string;
}

export interface WebSocketMessage {
  type: 'chat' | 'status' | 'error' | 'ping' | 'pong';
  data: any;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message: string;
  detail?: string;
}
