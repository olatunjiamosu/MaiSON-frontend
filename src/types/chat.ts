export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  property_id?: string;
  isLoading?: boolean;
}

export interface ChatResponse {
  message: string;
  conversation_id: number;
  session_id: string;
  intent: string;
  context: object;
}

export interface ChatHistory {
  conversation_id: number;
  messages: ChatMessage[];
}

export interface PropertyChatPayload {
  message: string;
  user_id: string;
  property_id: string;
  role: 'buyer' | 'seller';
  counterpart_id: string;
  session_id?: string;
}

export interface GeneralChatPayload {
  message: string;
  user_id?: string;
  session_id?: string;
} 