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
  type: string;
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
        console.log('Raw conversations data:', conversations);
        
        // Fetch messages for each conversation
        const formattedChats = await Promise.all(conversations.map(async (conv: any) => {
          const convId = conv.id || conv.conversation_id;
          const existingChat = convId ? existingChats[convId.toString()] : null;
          
          try {
            // Fetch messages for this conversation
            const messages = await ChatService.getChatHistory(convId, false);
            console.log(`Fetched ${messages.length} messages for conversation ${convId}`);
            
            // Get the first and last message content
            const firstMessage = messages[0]?.content;
            const lastMessage = messages[messages.length - 1]?.content;
            
            // Log the available content for titles
            console.log('Conversation content fields:', {
              id: conv.id,
              firstMessage: firstMessage,
              lastMessage: lastMessage,
              existingChatQuestion: existingChat?.question,
              messages: messages,
              last_message: messages[messages.length - 1]
            });
            
            // Log the available timestamp fields
            console.log('Conversation timestamp fields:', {
              id: conv.id,
              last_message_timestamp: messages[messages.length - 1]?.timestamp,
              started_at: conv.started_at,
              updated_at: conv.updated_at,
              created_at: conv.created_at
            });
            
            // Parse the timestamp from the API response, using last_message_timestamp as the primary source
            const timestamp = messages[messages.length - 1]?.timestamp || conv.started_at || conv.updated_at || conv.created_at;
            console.log('Selected timestamp:', timestamp);
            
            // Determine the title with more detailed logging
            const title = firstMessage || lastMessage || existingChat?.question || 'New Chat';
            console.log('Selected title:', title);
            
            return {
              id: conv.id?.toString() || conv.conversation_id?.toString() || Date.now().toString(),
              conversation_id: conv.id || conv.conversation_id || Date.now(),
              question: title,
              timestamp: timestamp || new Date().toISOString(),
              type: 'general'
            };
          } catch (error) {
            console.error(`Failed to fetch messages for conversation ${convId}:`, error);
            return {
              id: conv.id?.toString() || conv.conversation_id?.toString() || Date.now().toString(),
              conversation_id: conv.id || conv.conversation_id || Date.now(),
              question: existingChat?.question || 'New Chat',
              timestamp: conv.started_at || new Date().toISOString(),
              type: 'general'
            };
          }
        }));
        
        console.log('Formatted chats:', formattedChats);
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
      type: 'general'
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
            ? { ...chat, question, timestamp: 'Just now', type: 'general' }
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