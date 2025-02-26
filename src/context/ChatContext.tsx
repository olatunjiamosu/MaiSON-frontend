import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ChatService from '../services/ChatService';

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

  const refreshChatHistory = async () => {
    setIsLoadingChats(true);
    try {
      const conversations = await ChatService.getAllConversations(false); // false for general chats
      
      if (conversations && conversations.length > 0) {
        const formattedChats = conversations.map((conv: any) => ({
          id: conv.id.toString(),
          conversation_id: conv.id,
          question: conv.title || 'Chat with Mia',
          timestamp: conv.created_at 
            ? formatDistanceToNow(new Date(conv.created_at), { addSuffix: true }) 
            : 'Recently'
        }));
        
        setChatHistory(formattedChats);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      // Keep any existing data if there's an error
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Initial fetch of chat history
  useEffect(() => {
    refreshChatHistory();
  }, []);

  const addConversation = (question: string, conversationId: number) => {
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
      if (exists) {
        // Update the existing conversation
        return prev.map(chat => 
          chat.conversation_id === conversationId 
            ? { ...chat, question, timestamp: 'Just now' }
            : chat
        );
      } else {
        // Add new conversation
        return [newConversation, ...prev];
      }
    });
  };

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