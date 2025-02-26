import { ChatMessage, ChatResponse } from '../../types/chat';

let sessionId: string | null = null;

const ChatService = {
  sendMessage: jest.fn((message: string, isPropertyChat: boolean = false): Promise<ChatResponse> => {
    if (message === 'trigger API error') {
      return Promise.reject(new Error('API error: 500'));
    }
    
    if (message === 'trigger network error') {
      return Promise.reject(new Error('Network error'));
    }
    
    const response: ChatResponse = {
      message: `Response to: ${message}`,
      session_id: '12345',
      conversation_id: 1,
      intent: 'greeting',
      context: {}
    };
    
    sessionId = response.session_id;
    return Promise.resolve(response);
  }),
  
  getSessionId: jest.fn((): string | null => {
    return sessionId;
  }),
  
  clearSession: jest.fn((): void => {
    sessionId = null;
  }),
  
  getChatHistory: jest.fn((): Promise<ChatMessage[]> => {
    return Promise.resolve([
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi there! How can I help you?',
        timestamp: new Date().toISOString()
      }
    ]);
  }),
  
  getAllConversations: jest.fn((): Promise<any[]> => {
    return Promise.resolve([
      {
        id: 1,
        title: 'Conversation 1',
        last_message: 'Hello',
        created_at: new Date().toISOString()
      }
    ]);
  })
};

export default ChatService; 