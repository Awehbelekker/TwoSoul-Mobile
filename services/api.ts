/**
 * REST API Client for Universal Soul AI
 */

import { ChatRequest, ChatResponse, SystemStatus, PersonalityInfo, ApiError } from './types';

// Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'  // Development (adjust for your local IP if testing on device)
  : 'https://your-production-api.com';  // Production

class UniversalSoulAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<SystemStatus> {
    return this.fetch<SystemStatus>('/api/status');
  }

  /**
   * Get available personalities
   */
  async getPersonalities(): Promise<PersonalityInfo[]> {
    return this.fetch<PersonalityInfo[]>('/api/personalities');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetch('/health');
  }

  /**
   * Get root info
   */
  async getRootInfo(): Promise<any> {
    return this.fetch('/');
  }

  /**
   * Change base URL (useful for switching environments)
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const api = new UniversalSoulAPI();

// Export class for custom instances
export default UniversalSoulAPI;
