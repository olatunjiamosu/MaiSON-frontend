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
        conversations = await ChatService.getUserConversations(user.uid);
        
        // Filter to only include general conversations (non-property)
        conversations = conversations.filter((conv: any) => 
          conv.conversation_type === 'general'
        );
      } else {
        // Fallback to getting general conversations (for anonymous users)
        conversations = await ChatService.getAllConversations(false);
      }
      
      if (conversations && conversations.length > 0) {
        const formattedChats = conversations.map((conv: any) => ({
          id: conv.conversation_id.toString(),
          conversation_id: conv.conversation_id,
          question: conv.title || conv.last_message?.content || 'Chat with Mia',
          timestamp: conv.updated_at 
            ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }) 
            : 'Recently'
        }));
        
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
  return context;
}; 