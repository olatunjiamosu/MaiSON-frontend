import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ChatService from '../services/ChatService';
import { useAuth } from './AuthContext';

interface ChatHistory {
  id: string;
  question: string;
  timestamp: string;
  isActive?: boolean;
  conversation_id?: number;
}

interface ChatContextType {
  chatHistory: ChatHistory[];
  addConversation: (question: string, conversationId: number) => void;
  isLoadingChats: boolean;
  refreshChatHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const { user } = useAuth();

  const refreshChatHistory = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      let conversations = [];
      
      if (user?.uid) {
        // Use getUserConversations to get all general conversations for the user
        const response = await ChatService.getUserConversations(user.uid);
        console.log('ChatContext - Received user conversations response:', response);
        
        // Check if the response has the expected structure
        if (response && typeof response === 'object') {
          // Extract general conversations from the response
          conversations = response.general_conversations || [];
          console.log('ChatContext - Extracted general conversations:', conversations);
        } else {
          console.error('ChatContext - Invalid response format:', response);
          conversations = [];
        }
      } else {
        // Fallback to getting general conversations (for anonymous users)
        conversations = await ChatService.getAllConversations(false);
      }
      
      // Get existing chat history from localStorage to preserve question/taglines
      const storedHistory = localStorage.getItem('chat_history');
      let existingChats: Record<string, ChatHistory> = {};
      
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          // Create a map of conversation_id to chat history item
          existingChats = parsedHistory.reduce((acc: Record<string, ChatHistory>, chat: ChatHistory) => {
            if (chat.conversation_id) {
              acc[chat.conversation_id.toString()] = chat;
            }
            return acc;
          }, {});
        } catch (e) {
          console.error('Failed to parse stored chat history:', e);
        }
      }
      
      if (conversations && conversations.length > 0) {
        const formattedChats = conversations.map((conv: any) => {
          const convId = conv.id || conv.conversation_id;
          const existingChat = convId ? existingChats[convId.toString()] : null;
          
          return {
            id: conv.id?.toString() || conv.conversation_id?.toString() || Date.now().toString(),
            conversation_id: conv.id || conv.conversation_id || Date.now(),
            // Preserve the existing question/tagline if available
            question: existingChat?.question || conv.title || conv.last_message?.content || 'Chat with Mia',
            timestamp: conv.updated_at 
              ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }) 
              : 'Recently'
          };
        });
        
        setChatHistory(formattedChats);
        
        // Store in localStorage as a backup
        localStorage.setItem('chat_history', JSON.stringify(formattedChats));
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      
      // Try to load from localStorage as a fallback
      const storedHistory = localStorage.getItem('chat_history');
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          setChatHistory(parsedHistory);
        } catch (e) {
          console.error('Failed to parse stored chat history:', e);
        }
      }
    } finally {
      setIsLoadingChats(false);
    }
  }, [user]);

  // Load chat history on initial render and when user changes
  useEffect(() => {
    refreshChatHistory();
  }, [refreshChatHistory]);

  const addConversation = useCallback((question: string, conversationId: number) => {
    const newConversation: ChatHistory = {
      id: conversationId.toString(),
      conversation_id: conversationId,
      question: question,
      timestamp: 'Just now',
    };

    // Add to the beginning of the array to show newest first
    setChatHistory(prev => {
      // Check if this conversation already exists
      const exists = prev.some(chat => chat.conversation_id === conversationId);
      
      let updatedHistory;
      if (exists) {
        // Update the existing conversation
        updatedHistory = prev.map(chat => 
          chat.conversation_id === conversationId 
            ? { ...chat, question, timestamp: 'Just now' }
            : chat
        );
      } else {
        // Add new conversation
        updatedHistory = [newConversation, ...prev];
      }
      
      // Save to localStorage
      localStorage.setItem('chat_history', JSON.stringify(updatedHistory));
      
      return updatedHistory;
    });
  }, []);

  // Load initial chat history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('chat_history');
    if (storedHistory && chatHistory.length === 0) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setChatHistory(parsedHistory);
      } catch (e) {
        console.error('Failed to parse stored chat history:', e);
      }
    }
  }, []);

  return (
    <ChatContext.Provider value={{ 
      chatHistory, 
      addConversation, 
      isLoadingChats,
      refreshChatHistory
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};