import { ChatMessage, ChatResponse, PropertyChatPayload } from '../types/chat';
import { API_CONFIG } from '../config/api';
import { auth } from '../config/firebase'; // Import Firebase auth directly

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

  /**
   * Send a message to a property chat
   * @param payload The message payload
   * @returns The response from the API
   */
  async sendPropertyMessage(payload: PropertyChatPayload): Promise<ChatResponse> {
    try {
      console.log('Sending property message with payload:', {
        message: payload.message,
        property_id: payload.property_id,
        user_id: payload.user_id,
        role: payload.role,
        session_id: payload.session_id
      });
      
      // Check if we have a stored conversation ID for this property
      const storedConversationId = localStorage.getItem(`property_chat_conversation_${payload.property_id}`);
      if (storedConversationId) {
        console.log(`Found stored conversation ID ${storedConversationId} for property ${payload.property_id}`);
      }
      
      // Send the message to the property chat endpoint
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
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Property message sent successfully:', data);
      
      // Store the session ID for this specific property
      if (data.session_id) {
        localStorage.setItem(`property_chat_session_${payload.property_id}`, data.session_id);
        console.log(`Stored session ID for property ${payload.property_id}: ${data.session_id}`);
      }
      
      // Store the conversation ID for this property
      if (data.conversation_id) {
        localStorage.setItem(`property_chat_conversation_${payload.property_id}`, data.conversation_id.toString());
        console.log(`Stored conversation ID ${data.conversation_id} for property ${payload.property_id}`);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to send property message:', error);
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

  async getChatHistory(conversationId: number | string, isPropertyChat: boolean = false): Promise<ChatMessage[]> {
    try {
      console.log('getChatHistory called with:', { conversationId, isPropertyChat, type: typeof conversationId });
      
      // Ensure conversationId is a number
      const numericConversationId = typeof conversationId === 'string' 
        ? parseInt(conversationId, 10) 
        : conversationId;
      
      if (isNaN(numericConversationId) || !numericConversationId) {
        console.error('Invalid conversation ID:', conversationId);
        throw new Error(`Invalid conversation ID: ${conversationId}`);
      }
      
      // Use the template endpoint paths from API_CONFIG
      let endpoint = isPropertyChat 
        ? API_CONFIG.CHAT.PROPERTY_HISTORY
        : API_CONFIG.CHAT.GENERAL_HISTORY;
      
      // Replace the placeholder with the actual conversation ID
      endpoint = endpoint.replace('{conversation_id}', numericConversationId.toString());
      
      console.log('Fetching chat history from endpoint:', `${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`);
      
      // Get auth token if available
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add auth token if available
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        
        // If the conversation doesn't exist, return an empty array instead of throwing
        if (response.status === 404) {
          console.warn(`Conversation with ID ${numericConversationId} not found. Returning empty array.`);
          return [];
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Chat history response:', data);
      
      // Extract messages from the response
      const messages = data.messages || [];
      
      // Store the property_id if it's included in the response
      if (isPropertyChat && data.property_id) {
        localStorage.setItem(`property_chat_property_${numericConversationId}`, data.property_id);
        console.log(`Stored property ID ${data.property_id} for conversation ${numericConversationId}`);
      }
      
      return messages;
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return [];
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
  async getUserConversations(userId: string, role?: 'buyer' | 'seller', status?: 'active' | 'pending' | 'closed'): Promise<any> {
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
      
      // Get the authentication token if available
      let authToken = '';
      try {
        authToken = await auth.currentUser?.getIdToken() || '';
      } catch (e) {
        console.warn('Failed to get auth token:', e);
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add the auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      console.log('Fetching user conversations from:', `${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.API_VERSION}${endpoint}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`API error: ${response.status}`, errorData);
        throw new Error(`API error: ${response.status}${errorData ? ' - ' + JSON.stringify(errorData) : ''}`);
      }

      const data = await response.json();
      console.log('Received user conversations:', data);
      
      // Return the full response object which contains general_conversations and property_conversations
      return data || { general_conversations: [], property_conversations: [] };
    } catch (error) {
      console.error('Get user conversations error:', error);
      // Return empty object with empty arrays instead of throwing to make it easier to handle in UI
      return { general_conversations: [], property_conversations: [] };
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

  /**
   * Initiate a new property chat
   * This creates a new conversation about a specific property
   * @returns The response including conversation_id
   */
  async initiatePropertyChat(propertyId: string, sellerId: string, initialMessage: string): Promise<ChatResponse & { conversation_id?: number }> {
    try {
      console.log('Initiating property chat for property_id:', propertyId);
      
      // Get the current user's ID from Firebase
      const userInfo = localStorage.getItem('user');
      let userId = '';
      
      // Try to get user from localStorage first
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          if (user.uid) {
            userId = user.uid;
          }
        } catch (e) {
          console.warn('Failed to parse user info from localStorage');
        }
      }
      
      // If we couldn't get the user ID from localStorage, try to get it from the auth context
      if (!userId) {
        // Check if we have a Firebase auth object available
        try {
          // Try to get the current user from Firebase auth
          const currentUser = auth.currentUser;
          
          if (currentUser?.uid) {
            userId = currentUser.uid;
          } else {
            // If we still don't have a user ID, check session storage as a fallback
            const sessionUser = sessionStorage.getItem('user');
            if (sessionUser) {
              const parsedUser = JSON.parse(sessionUser);
              if (parsedUser.uid) {
                userId = parsedUser.uid;
              }
            }
          }
        } catch (e) {
          console.warn('Failed to get user from Firebase auth:', e);
        }
      }
      
      // If we still don't have a user ID, throw an error
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      // Generate a unique session ID for this property chat
      // This ensures each property gets its own conversation thread
      const uniqueSessionId = `property_${propertyId}_${userId}_${Date.now()}`;
      console.log('Generated unique session ID for property chat:', uniqueSessionId);
      
      // Create the payload for the property chat
      const payload = {
        message: initialMessage,
        user_id: userId,
        property_id: propertyId,
        role: 'buyer',
        counterpart_id: sellerId,
        session_id: uniqueSessionId
      };
      
      console.log('Initiating property chat with payload:', payload);
      
      // Send the message to the property chat endpoint
      const endpoint = `${this.baseUrl}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.PROPERTY}`;
      
      // Get the authentication token if available
      let authToken = '';
      try {
        authToken = await auth.currentUser?.getIdToken() || '';
      } catch (e) {
        console.warn('Failed to get auth token:', e);
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add the auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Property chat initiated successfully:', data);
      
      // Store the session ID for this specific property
      if (data.session_id) {
        localStorage.setItem(`property_chat_session_${propertyId}`, data.session_id);
        console.log(`Stored session ID for property ${propertyId}: ${data.session_id}`);
      }
      
      // Store the conversation ID for this property
      if (data.conversation_id) {
        localStorage.setItem(`property_chat_conversation_${propertyId}`, data.conversation_id.toString());
        localStorage.setItem('last_property_chat_id', data.conversation_id.toString());
        console.log(`Stored conversation ID ${data.conversation_id} for property ${propertyId}`);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to initiate property chat:', error);
      throw error;
    }
  }
}

export default new ChatService(); 