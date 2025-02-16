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
  private apiVersion: string;
  private currentSessionId: string | null;

  constructor() {
    this.baseUrl = getEnvVar(
      'VITE_API_BASE_URL',
      'http://maison-chatbot.hqfta8d9brd5f0da.uksouth.azurecontainer.io:8000'
    );
    this.apiVersion = getEnvVar('VITE_API_VERSION', '/api/v1');
    this.currentSessionId = null;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.apiVersion}/chat/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            sessionId: this.currentSessionId
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
}

export default new ChatService(); 