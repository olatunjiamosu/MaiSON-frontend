import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ChatService from '../services/ChatService';
import { useAuth } from './AuthContext';
import PropertyService from '../services/PropertyService';

interface ChatHistory {
  id: string;
  question: string;
  timestamp: string;
  isActive?: boolean;
  conversation_id?: number;
  type: string;
  property_id?: string;
  property_details?: any;
}

interface Conversation {
  id: number;
  property_id?: string;
  property_details?: any;
  is_property_chat?: boolean;
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
        // Get all conversations (both general and property) in one call
        const response = await ChatService.getUserConversations(user.uid);
        console.log('ChatContext - Received user conversations response:', response);
        
        // Check if the response has the expected structure
        if (response && typeof response === 'object') {
          // Extract both general and property conversations
          const generalConversations = response.general_conversations || [];
          const propertyConversations = response.property_conversations || [];
          
          console.log('Property conversations from API:', propertyConversations.map((conv: Conversation) => ({
            id: conv.id,
            property_id: conv.property_id,
            property_details: conv.property_details,
            is_property_chat: conv.is_property_chat
          })));
          
          // Combine and process all conversations
          conversations = [...generalConversations, ...propertyConversations];
          console.log('ChatContext - Extracted conversations:', conversations);
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
      
      if (conversations.length > 0) {
        console.log('Raw conversations data:', conversations);
        
        // Fetch messages for each conversation
        const formattedChats = await Promise.all(conversations.map(async (conv: any) => {
          const convId = conv.id || conv.conversation_id;
          const existingChat = convId ? existingChats[convId.toString()] : null;
          
          try {
            // Determine if this is a property chat
            const isPropertyChat = conv.is_property_chat || conv.property_id || conv.property_details;
            console.log('Processing conversation:', {
              id: convId,
              isPropertyChat,
              property_id: conv.property_id,
              property_details: conv.property_details
            });
            
            // Fetch messages for this conversation
            const messages = await ChatService.getChatHistory(convId, isPropertyChat);
            console.log(`Fetched ${messages.length} messages for conversation ${convId} (${isPropertyChat ? 'property' : 'general'} chat)`);
            
            // Get the first and last message content
            const firstMessage = messages[0]?.content;
            const lastMessage = messages[messages.length - 1]?.content;
            
            // Parse the timestamp from the API response
            const timestamp = messages[messages.length - 1]?.timestamp || conv.started_at || conv.updated_at || conv.created_at;
            
            // Determine the title based on chat type
            let title = 'New Chat';
            
            if (isPropertyChat) {
              console.log('Property details for chat:', {
                id: convId,
                property_details: conv.property_details,
                address: conv.property_details?.address,
                street: conv.property_details?.street,
                city: conv.property_details?.city,
                postcode: conv.property_details?.postcode,
                title: conv.property_details?.title
              });
              
              // For property chats, try to use the property address or last message
              let propertyDetails = conv.property_details;
              
              // If we don't have property details but have a property_id, fetch them
              if (!propertyDetails && conv.property_id) {
                try {
                  console.log(`Fetching property details for property_id: ${conv.property_id}`);
                  const propertyData = await PropertyService.getPropertyById(conv.property_id);
                  propertyDetails = {
                    address: propertyData.address ? `${propertyData.address.street}, ${propertyData.address.city}` : 'Unknown address',
                    street: propertyData.address.street,
                    city: propertyData.address.city,
                    postcode: propertyData.address.postcode
                  };
                  console.log('Fetched property details:', propertyDetails);
                } catch (error) {
                  console.error(`Failed to fetch property details for ${conv.property_id}:`, error);
                }
              }
              
              if (propertyDetails?.address) {
                title = propertyDetails.address;
              } else if (propertyDetails?.street) {
                title = `${propertyDetails.street}${propertyDetails.city ? `, ${propertyDetails.city}` : ''}${propertyDetails.postcode ? ` ${propertyDetails.postcode}` : ''}`.trim();
              } else if (conv.property_id) {
                title = `Property Chat (${conv.property_id.substring(0, 8)}...)`;
              } else if (lastMessage) {
                title = lastMessage;
              } else if (firstMessage) {
                title = firstMessage;
              }
            } else {
              // For general chats, use the first or last message
              title = firstMessage || lastMessage || existingChat?.question || 'New Chat';
            }
            
            return {
              id: conv.id?.toString() || conv.conversation_id?.toString() || Date.now().toString(),
              conversation_id: conv.id || conv.conversation_id || Date.now(),
              question: title,
              timestamp: timestamp || new Date().toISOString(),
              type: isPropertyChat ? 'property' : 'general',
              property_id: conv.property_id,
              property_details: conv.property_details
            };
          } catch (error) {
            console.error(`Failed to fetch messages for conversation ${convId}:`, error);
            return {
              id: conv.id?.toString() || conv.conversation_id?.toString() || Date.now().toString(),
              conversation_id: conv.id || conv.conversation_id || Date.now(),
              question: existingChat?.question || 'New Chat',
              timestamp: conv.started_at || new Date().toISOString(),
              type: conv.is_property_chat ? 'property' : 'general',
              property_id: conv.property_id,
              property_details: conv.property_details
            };
          }
        }));
        
        console.log('Formatted chats:', formattedChats);
        
        // Deduplicate property chats by property_id, keeping only the most recent one
        const deduplicatedChats = formattedChats.reduce((acc: ChatHistory[], chat: ChatHistory) => {
          if (chat.type === 'property' && chat.property_id) {
            const existingChat = acc.find(c => c.property_id === chat.property_id);
            if (!existingChat) {
              acc.push(chat);
            } else {
              // If we already have a chat for this property, only replace it if this one is newer
              const existingTimestamp = new Date(existingChat.timestamp).getTime();
              const newTimestamp = new Date(chat.timestamp).getTime();
              if (newTimestamp > existingTimestamp) {
                const index = acc.findIndex(c => c.property_id === chat.property_id);
                acc[index] = chat;
              }
            }
          } else {
            // For general chats, just add them
            acc.push(chat);
          }
          return acc;
        }, []);
        
        console.log('Deduplicated chats:', deduplicatedChats);
        setChatHistory(deduplicatedChats);
        
        // Store in localStorage as a backup
        localStorage.setItem('chat_history', JSON.stringify(deduplicatedChats));
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