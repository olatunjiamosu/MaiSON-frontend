import { ChatMessage, ChatResponse, PropertyChatPayload } from '../types/chat';
import { API_CONFIG } from '../config/api';

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
  private static instance: ChatService;

  constructor() {
    this.baseUrl = getEnvVar(
      'VITE_API_BASE_URL',
      'https://maisonbot-api.xyz'
    );
    
    // Load session ID from localStorage if available
    this.currentSessionId = localStorage.getItem('chat_session_id');
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(message: string, isPropertyChat: boolean = false, conversationId?: number): Promise<ChatResponse> {
    try {
      const endpoint = isPropertyChat 
        ? `${this.baseUrl}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.PROPERTY}`
        : `${this.baseUrl}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.GENERAL}`;
      
      const payload: any = {
        message: message,
        session_id: this.currentSessionId
      };
      
      // If we have a user ID from auth, include it
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          if (user.uid) {
            payload.user_id = user.uid;
          }
        } catch (e) {
          console.warn('Failed to parse user info from localStorage');
        }
      }
      
      // If continuing an existing conversation
      if (conversationId) {
        payload.conversation_id = conversationId;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.currentSessionId = data.session_id;
      
      // Save session ID to localStorage
      if (data.session_id) {
        localStorage.setItem('chat_session_id', data.session_id);
      }
      
      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  // Update the sendPropertyMessage method to use API_CONFIG
  async sendPropertyMessage(payload: PropertyChatPayload): Promise<ChatResponse> {
    try {
      const endpoint = `${this.baseUrl}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.PROPERTY}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.currentSessionId = data.session_id;
      return data;
    } catch (error) {
      console.error('Property chat error:', error);
      throw error;
    }
  }

  getSessionId(): string | null {
    return this.currentSessionId;
  }

  clearSession(): void {
    this.currentSessionId = null;
    localStorage.removeItem('chat_session_id');
  }

  clearAllChatData(): void {
    // Clear all chat-related localStorage items
    localStorage.removeItem('chat_session_id');
    localStorage.removeItem('chat_history');
    localStorage.removeItem('selected_chat');
    
    // Clear all stored conversation messages
    // First, get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Then remove any keys that start with 'chat_messages_'
    keys.forEach(key => {
      if (key.startsWith('chat_messages_')) {
        localStorage.removeItem(key);
      }
    });
    
    this.currentSessionId = null;
  }

  async getChatHistory(conversationId: number, isPropertyChat: boolean = false): Promise<ChatMessage[]> {
    try {
      // Use the template endpoint paths from API_CONFIG
      let endpoint = isPropertyChat 
        ? API_CONFIG.CHAT.PROPERTY_HISTORY
        : API_CONFIG.CHAT.GENERAL_HISTORY;
      
      // Replace the placeholder with the actual conversation ID
      endpoint = endpoint.replace('{conversation_id}', conversationId.toString());
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`, {
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
      return data.messages || [];
    } catch (error) {
      console.error('Chat history error:', error);
      throw error;
    }
  }

  async getAllConversations(isPropertyChat: boolean = false): Promise<any[]> {
    try {
      const endpoint = isPropertyChat 
        ? '/api/v1/conversations/property' 
        : '/api/v1/conversations/general';
      
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
      return data.conversations || [];
    } catch (error) {
      console.error('Get all conversations error:', error);
      // Return empty array instead of throwing to make it easier to handle in UI
      return [];
    }
  }

  // Update the getUserConversations method to use API_CONFIG
  async getUserConversations(userId: string, role?: 'buyer' | 'seller', status?: 'active' | 'pending' | 'closed'): Promise<any[]> {
    try {
      // Use the template endpoint path from API_CONFIG
      let endpoint = API_CONFIG.CHAT.USER_CONVERSATIONS.replace('{user_id}', userId);
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`, {
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
      return data || [];
    } catch (error) {
      console.error('Get user conversations error:', error);
      // Return empty array instead of throwing to make it easier to handle in UI
      return [];
    }
  }

  // Update the updateConversationStatus method to use API_CONFIG
  async updateConversationStatus(conversationId: number, status: 'active' | 'pending' | 'closed'): Promise<any> {
    try {
      // Use the template endpoint path from API_CONFIG
      const endpoint = API_CONFIG.CHAT.UPDATE_STATUS.replace('{conversation_id}', conversationId.toString());
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update conversation status error:', error);
      throw error;
    }
  }
}

export default new ChatService(); 