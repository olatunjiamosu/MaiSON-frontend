import { ChatMessage } from '../types/chat';

export interface ChatResponse {
  message: string;
  sessionId: string;
}

const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
    return (window as any).env[key];
  }
  return defaultValue;
};

class ChatService {
  private baseUrl: string;
  private currentSessionId: string | null;

  constructor() {
    this.baseUrl = getEnvVar(
      'VITE_API_BASE_URL',
      'https://maisonbot-api.xyz'
    );
    this.currentSessionId = null;
  }

  async sendMessage(message: string, isPropertyChat: boolean = false): Promise<ChatResponse> {
    try {
      const endpoint = isPropertyChat ? '/api/v1/chat/property' : '/api/v1/chat/general';
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: message,
            sessionId: this.currentSessionId,
            user_id: "guest",
            user_name: "Guest User",
            user_email: "guest@example.com"
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.currentSessionId = data.sessionId;
      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  getSessionId(): string | null {
    return this.currentSessionId;
  }

  clearSession(): void {
    this.currentSessionId = null;
  }

  async getChatHistory(conversationId: number, isPropertyChat: boolean = false): Promise<ChatMessage[]> {
    try {
      const endpoint = isPropertyChat 
        ? `/api/v1/conversations/property/${conversationId}/history` 
        : `/api/v1/conversations/general/${conversationId}/history`;
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Chat history error:', error);
      throw error;
    }
  }
}

export default new ChatService(); 