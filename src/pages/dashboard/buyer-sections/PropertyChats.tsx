import React, { useState, useEffect, useRef } from 'react';
import { Home, CircleUserRound, Send, Search, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatService from '../../../services/ChatService';
import PropertyService from '../../../services/PropertyService';
import { useAuth } from '../../../context/AuthContext';
import { ChatMessage } from '../../../types/chat';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';

// Simple Spinner component
const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-emerald-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

interface PropertyChatItem {
  conversation_id: number;
  property_id: string;
  property_details: {
    address: string;
    price: string;
    images?: string[];
    thumbnail?: string;
    seller_id?: string;
  };
  last_message: {
    content: string;
    timestamp: string;
  };
  unread_count: number;
  status: 'active' | 'pending' | 'closed';
  type: 'property';
}

interface PropertyAddress {
  street?: string;
  city?: string;
  postcode?: string;
  [key: string]: any; // Allow for other address properties
}

const PropertyChats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [propertyChatsList, setPropertyChatsList] = useState<PropertyChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<PropertyChatItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Store chat messages for each property to prevent losing them when switching
  const [propertyMessagesMap, setPropertyMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  
  // Ref to track if it's safe to refresh (not in the middle of sending a message)
  const isRefreshSafe = useRef<boolean>(true);

  // Define fetchPropertyChats function so it can be called from handleSendMessage
  const fetchPropertyChats = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('Fetching user conversations for user ID:', user.uid);
      const response = await ChatService.getUserConversations(user.uid);
      console.log('Received user conversations response:', response);
      
      // Extract property conversations from the response
      if (!response || typeof response !== 'object') {
        console.error('Invalid response format:', response);
        setPropertyChatsList([]);
        return;
      }
      
      const propertyConversations = response.property_conversations || [];
      console.log('Property chats extracted from response:', propertyConversations);
      
      // Process each chat and fetch property details if needed
      const formattedChats = await Promise.all(propertyConversations.map(async (conv: any) => {
        const convId = conv.id || conv.conversation_id;
        const propertyId = conv.property_id;
        
        try {
          // Fetch messages for this conversation
          const messages = await ChatService.getChatHistory(convId, true);
          console.log(`Fetched ${messages.length} messages for property conversation ${convId}`);
          
          // Get the first and last message content
          const firstMessage = messages[0]?.content;
          const lastMessage = messages[messages.length - 1]?.content;
          
          // Parse the timestamp from the API response
          const timestamp = messages[messages.length - 1]?.timestamp || conv.started_at || conv.updated_at || conv.created_at;
          
          // Get property details
          let propertyDetails = conv.property_details;
          if (!propertyDetails || propertyDetails.address === 'Unknown address') {
            try {
              const propertyData = await PropertyService.getPropertyById(propertyId);
              propertyDetails = {
                address: propertyData.address ? `${propertyData.address.street}, ${propertyData.address.city}` : 'Unknown address',
                price: propertyData.price ? `£${propertyData.price.toLocaleString()}` : '0',
                images: propertyData.image_urls || [],
                thumbnail: propertyData.main_image_url || (propertyData.image_urls && propertyData.image_urls.length > 0 ? propertyData.image_urls[0] : ''),
                seller_id: propertyData.seller_id || ''
              };
            } catch (error) {
              console.error(`Failed to fetch property details for ${propertyId}:`, error);
              propertyDetails = {
                address: 'Unknown address',
                price: '0',
                images: [],
                thumbnail: '',
                seller_id: ''
              };
            }
          }
          
          return {
            conversation_id: conv.id || conv.conversation_id || Date.now(),
            property_id: propertyId,
            property_details: propertyDetails,
            last_message: {
              content: lastMessage || 'No messages yet',
              timestamp: timestamp || new Date().toISOString()
            },
            unread_count: conv.unread_count || 0,
            status: conv.status || 'active',
            type: 'property'
          };
        } catch (error) {
          console.error(`Failed to fetch messages for property conversation ${convId}:`, error);
          return {
            conversation_id: conv.id || conv.conversation_id || Date.now(),
            property_id: propertyId,
            property_details: {
              address: 'Unknown address',
              price: '0',
              images: [],
              thumbnail: '',
              seller_id: ''
            },
            last_message: {
              content: 'Failed to load messages',
              timestamp: conv.started_at || new Date().toISOString()
            },
            unread_count: 0,
            status: 'error',
            type: 'property'
          };
        }
      }));
      
      // Deduplicate chats by property_id, keeping only the most recent one
      const uniqueChats = formattedChats.reduce((acc: PropertyChatItem[], chat: PropertyChatItem) => {
        const existingChat = acc.find(c => c.property_id === chat.property_id);
        if (!existingChat) {
          acc.push(chat);
        } else {
          // If we already have a chat for this property, only replace it if this one is newer
          const existingTimestamp = new Date(existingChat.last_message.timestamp).getTime();
          const newTimestamp = new Date(chat.last_message.timestamp).getTime();
          if (newTimestamp > existingTimestamp) {
            const index = acc.findIndex(c => c.property_id === chat.property_id);
            acc[index] = chat;
          }
        }
        return acc;
      }, []);
      
      console.log('Deduplicated property chats:', uniqueChats);
      setPropertyChatsList(uniqueChats);
      
      // If we have a selected chat, update it with the latest data
      if (selectedChat) {
        const updatedSelectedChat = uniqueChats.find(
          (chat: PropertyChatItem) => chat.property_id === selectedChat.property_id
        );
        
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      } else if (uniqueChats.length > 0) {
        // If no chat is selected and we have chats, select the first one
        setSelectedChat(uniqueChats[0]);
      }
    } catch (error) {
      console.error('Failed to fetch property chats:', error);
      setPropertyChatsList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's property conversations when component mounts
  useEffect(() => {
    const loadPropertyChats = async () => {
      await fetchPropertyChats();
      
      // Check if we have a last property chat ID from a recent chat initiation
      const lastPropertyChatId = localStorage.getItem('last_property_chat_id');
      console.log('Last property chat ID from localStorage:', lastPropertyChatId);
      
      if (lastPropertyChatId && propertyChatsList.length > 0) {
        // Find the chat with this conversation ID
        const chatToSelect = propertyChatsList.find(
          chat => chat.conversation_id === Number(lastPropertyChatId)
        );
        
        if (chatToSelect) {
          console.log('Selecting last created property chat:', chatToSelect);
          setSelectedChat(chatToSelect);
          
          // Clear the last property chat ID to avoid selecting it again on refresh
          localStorage.removeItem('last_property_chat_id');
        } else {
          console.log('Could not find chat with conversation ID:', lastPropertyChatId);
          
          // If the backend doesn't have this conversation, remove it from localStorage
          localStorage.removeItem('last_property_chat_id');
          
          // Also check if we need to clean up any stale localStorage entries
          cleanupStalePropertyChats();
        }
      } else if (propertyChatsList.length === 0) {
        // If the backend returned no property chats, check if we need to clean up localStorage
        cleanupStalePropertyChats();
      }
    };
    
    // Function to clean up stale property chat entries in localStorage
    const cleanupStalePropertyChats = () => {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      
      // Find all property chat conversation IDs stored in localStorage
      const propertyConversationKeys = keys.filter(key => 
        key.startsWith('property_chat_conversation_')
      );
      
      if (propertyConversationKeys.length > 0) {
        console.log('Found potential stale property chat entries in localStorage:', propertyConversationKeys);
        
        // If the backend returned no conversations but we have localStorage entries,
        // these entries are likely stale and should be removed
        if (propertyChatsList.length === 0) {
          console.log('Backend returned no conversations, cleaning up stale localStorage entries');
          
          propertyConversationKeys.forEach(key => {
            const propertyId = key.replace('property_chat_conversation_', '');
            
            // Remove all related localStorage entries for this property
            localStorage.removeItem(`property_chat_conversation_${propertyId}`);
            localStorage.removeItem(`property_chat_session_${propertyId}`);
            localStorage.removeItem(`property_chat_messages_${propertyId}`);
            
            console.log(`Removed stale localStorage entries for property ${propertyId}`);
          });
        } else {
          // If the backend returned some conversations, only remove entries that don't match
          const validConversationIds = propertyChatsList.map(chat => chat.conversation_id.toString());
          
          propertyConversationKeys.forEach(key => {
            const propertyId = key.replace('property_chat_conversation_', '');
            const conversationId = localStorage.getItem(key);
            
            if (conversationId && !validConversationIds.includes(conversationId)) {
              console.log(`Conversation ID ${conversationId} for property ${propertyId} not found in backend response, removing`);
              
              // Remove all related localStorage entries for this property
              localStorage.removeItem(`property_chat_conversation_${propertyId}`);
              localStorage.removeItem(`property_chat_session_${propertyId}`);
              localStorage.removeItem(`property_chat_messages_${propertyId}`);
            }
          });
        }
      }
    };
    
    loadPropertyChats();
    
    // Remove the auto-refresh interval - we'll only refresh when necessary
    // (e.g., after sending a message or manually refreshing)
    
  }, [user]);  // Only depend on user changes

  // Fetch chat messages when a property is selected
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!selectedChat) return;
      
      // When switching to a new property, store the current messages for the previous property
      if (chatMessages.length > 0) {
        const previousPropertyId = chatMessages[0]?.property_id;
        
        if (previousPropertyId && previousPropertyId !== selectedChat.property_id) {
          console.log(`Storing ${chatMessages.length} messages for property ${previousPropertyId}`);
          
          // Store messages in the map
          setPropertyMessagesMap(prev => ({
            ...prev,
            [previousPropertyId]: chatMessages
          }));
          
          // Also store in localStorage as backup
          try {
            const chatKey = `property_chat_messages_${previousPropertyId}`;
            localStorage.setItem(chatKey, JSON.stringify(chatMessages));
          } catch (e) {
            console.error('Failed to store messages in localStorage:', e);
          }
        }
      }
      
      // Check if we have stored messages for this property
      const storedMessages = propertyMessagesMap[selectedChat.property_id];
      if (storedMessages && storedMessages.length > 0) {
        console.log(`Restoring ${storedMessages.length} messages for property ${selectedChat.property_id} from memory`);
        setChatMessages(storedMessages);
        return;
      }
      
      try {
        // Convert conversation_id to number to ensure compatibility with API
        const conversationId = Number(selectedChat.conversation_id);
        console.log(`Fetching chat messages for conversation ID: ${conversationId} for property: ${selectedChat.property_id}`);
        
        // Try to load from localStorage first
        try {
          const chatKey = `property_chat_messages_${selectedChat.property_id}`;
          const storedMessages = localStorage.getItem(chatKey);
          
          if (storedMessages) {
            const parsedMessages = JSON.parse(storedMessages) as ChatMessage[];
            console.log(`Loaded ${parsedMessages.length} messages from localStorage for property ${selectedChat.property_id}`);
            
            if (parsedMessages.length > 0) {
              setChatMessages(parsedMessages);
              
              // Also update the in-memory map
              setPropertyMessagesMap(prev => ({
                ...prev,
                [selectedChat.property_id]: parsedMessages
              }));
              
              return;
            }
          }
        } catch (e) {
          console.error('Failed to load messages from localStorage:', e);
        }
        
        // If no stored messages, fetch from API
        const messages = await ChatService.getChatHistory(conversationId, true); // true for property chat
        console.log('Received chat messages from API:', messages);
        
        // If we didn't get any messages, try to load from localStorage
        if (!messages || messages.length === 0) {
          console.log('No messages received from API');
          setChatMessages([]);
          return;
        }
        
        // Log the date range of messages
        if (messages.length > 0) {
          const oldestTimestamp = messages[0].timestamp;
          const newestTimestamp = messages[messages.length - 1].timestamp;
          
          if (oldestTimestamp && newestTimestamp) {
            const oldestMessage = new Date(oldestTimestamp);
            const newestMessage = new Date(newestTimestamp);
            console.log(`Message date range: ${oldestMessage.toLocaleDateString()} to ${newestMessage.toLocaleDateString()}`);
          } else {
            console.log('Some messages are missing timestamps');
          }
        }
        
        // Ensure messages have the correct role set
        const processedMessages = messages.map(msg => {
          // Add property_id to each message for tracking
          const msgWithProperty = {
            ...msg,
            property_id: selectedChat.property_id
          };
          
          // If the message doesn't have a role or it's not explicitly set to 'assistant',
          // check the content to determine if it's likely a user message
          if (!msg.role || msg.role !== 'assistant') {
            // Common patterns in user messages
            const userPatterns = [
              'interested in this property',
              'how many rooms',
              'where is this property',
              'can you tell me more',
              'what is the price',
              'is there a garden',
              'when was it built',
              'is it available',
              'can i view'
            ];
            
            // Check if the message content matches any user patterns
            const isLikelyUserMessage = userPatterns.some(pattern => 
              msg.content.toLowerCase().includes(pattern)
            );
            
            if (isLikelyUserMessage) {
              return { ...msgWithProperty, role: 'user' as 'user' };
            }
          }
          
          // Default to assistant if not determined to be a user
          return { ...msgWithProperty, role: msg.role as 'user' | 'assistant' || 'assistant' };
        });
        
        console.log(`Processed ${processedMessages.length} messages for display`);
        setChatMessages(processedMessages);
        
        // Also update the in-memory map
        setPropertyMessagesMap(prev => ({
          ...prev,
          [selectedChat.property_id]: processedMessages
        }));
        
        // Store the conversation ID for this property
        if (conversationId) {
          localStorage.setItem(`property_chat_conversation_${selectedChat.property_id}`, conversationId.toString());
          console.log(`Stored conversation ID ${conversationId} for property ${selectedChat.property_id}`);
        }
        
        // Also store the messages in localStorage as a backup
        try {
          const chatKey = `property_chat_messages_${selectedChat.property_id}`;
          localStorage.setItem(chatKey, JSON.stringify(processedMessages));
          console.log(`Stored ${processedMessages.length} messages in localStorage for property ${selectedChat.property_id}`);
        } catch (e) {
          console.error('Failed to store messages in localStorage:', e);
        }
        
        // Mark as read logic could be implemented here
      } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        setChatMessages([]);
      }
    };

    fetchChatMessages();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user?.uid) return;

    // Log detailed information about the selected chat and property
    console.log('Sending message for property:', {
      property_id: selectedChat.property_id,
      conversation_id: selectedChat.conversation_id,
      property_details: selectedChat.property_details,
      message: message
    });
    
    // Store the message to send before clearing the input
    const messageToSend = message.trim();
    
    // Optimistically add message to UI
    const tempId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
      property_id: selectedChat.property_id // Add property_id to track which property this message belongs to
    };
    
    // Update chat messages with the new user message
    setChatMessages(prev => [...prev, newUserMessage]);
    setMessage('');
    
    try {
      // Set the refresh safety flag to false to prevent auto-refresh during message sending
      isRefreshSafe.current = false;
      
      // Get the session ID for this specific property
      const propertySessionId = localStorage.getItem(`property_chat_session_${selectedChat.property_id}`);
      const propertyConversationId = localStorage.getItem(`property_chat_conversation_${selectedChat.property_id}`);
      
      console.log(`Using session ID for property ${selectedChat.property_id}:`, propertySessionId);
      console.log(`Using conversation ID for property ${selectedChat.property_id}:`, propertyConversationId);
      
      // If this is a new conversation for this property, don't send a session ID
      // This will force the backend to create a new session for this property
      const isNewConversationForProperty = !propertySessionId || !propertyConversationId;
      
      // Send message to API with explicit property_id
      const payload = {
        message: messageToSend,
        user_id: user.uid,
        property_id: selectedChat.property_id,
        role: 'buyer' as 'buyer',
        counterpart_id: selectedChat.property_details?.seller_id || 'unknown',
        // Only include session_id if we have one for this specific property
        session_id: isNewConversationForProperty ? undefined : propertySessionId
      };
      
      console.log('Initiating property chat with payload:', payload);
      
      const response = await ChatService.sendPropertyMessage(payload);
      
      console.log('Received response from sendPropertyMessage:', response);
      
      // Store the session ID for this specific property
      if (response.session_id) {
        localStorage.setItem(`property_chat_session_${selectedChat.property_id}`, response.session_id);
        console.log(`Stored session ID for property ${selectedChat.property_id}: ${response.session_id}`);
      }
      
      // Store the conversation ID for this specific property
      if (response.conversation_id) {
        localStorage.setItem(`property_chat_conversation_${selectedChat.property_id}`, response.conversation_id.toString());
        console.log(`Stored conversation ID for property ${selectedChat.property_id}: ${response.conversation_id}`);
      }
      
      // Add AI response to messages
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        property_id: selectedChat.property_id // Add property_id to track which property this message belongs to
      };
      
      // Update chat messages with both the user message and AI response
      // This ensures we don't lose messages when the state updates
      setChatMessages(prev => {
        // Check if the user message is already in the list to avoid duplicates
        const userMessageExists = prev.some(msg => msg.id === tempId);
        
        const updatedMessages = userMessageExists 
          ? [...prev, aiResponse] 
          : [...prev, newUserMessage, aiResponse];
        
        // Also update the in-memory map
        setPropertyMessagesMap(prevMap => ({
          ...prevMap,
          [selectedChat.property_id]: updatedMessages
        }));
        
        return updatedMessages;
      });
      
      // Store messages in localStorage as a backup
      try {
        const chatKey = `property_chat_messages_${selectedChat.property_id}`;
        const existingMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        
        // Check if the user message is already in localStorage
        const userMessageExists = existingMessages.some((msg: ChatMessage) => msg.id === tempId);
        
        const updatedMessages = userMessageExists
          ? [...existingMessages, aiResponse]
          : [...existingMessages, newUserMessage, aiResponse];
        
        localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
        console.log(`Stored ${updatedMessages.length} messages in localStorage for property ${selectedChat.property_id}`);
      } catch (e) {
        console.error('Failed to store messages in localStorage:', e);
      }
      
      // Refresh the chat list to get updated last_message
      // This is important to ensure the UI reflects the latest message
      // But don't reset the current chat messages
      setTimeout(() => {
        // Only refresh if we're still on the same property
        if (selectedChat && selectedChat.property_id === payload.property_id) {
          fetchPropertyChats();
        }
        
        // Re-enable auto-refresh after message sending is complete
        isRefreshSafe.current = true;
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message if sending failed
      setChatMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Also update the in-memory map to remove the failed message
      setPropertyMessagesMap(prevMap => {
        const currentMessages = prevMap[selectedChat.property_id] || [];
        return {
          ...prevMap,
          [selectedChat.property_id]: currentMessages.filter(msg => msg.id !== tempId)
        };
      });
      
      // Show error to user
      toast.error('Failed to send message. Please try again.');
      
      // Re-enable auto-refresh even if there was an error
      isRefreshSafe.current = true;
    }
  };

  // Helper function to get a display name for the property
  const getPropertyDisplayName = (chat: PropertyChatItem): string => {
    const propertyDetails = chat.property_details || {};
    
    if (typeof propertyDetails.address === 'string') {
      return propertyDetails.address;
    } else if (propertyDetails.address) {
      const address = propertyDetails.address as PropertyAddress;
      const addressParts = [
        address.street,
        address.city,
        address.postcode
      ].filter(Boolean);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    return 'Unknown Property';
  };

  // Utility function to clear all property chat session data
  const clearAllPropertyChatData = () => {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter keys related to property chats
    const propertyChatKeys = keys.filter(key => 
      key.startsWith('property_chat_session_') || 
      key.startsWith('property_chat_conversation_') ||
      key.startsWith('property_chat_messages_')
    );
    
    // Remove each key
    propertyChatKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${propertyChatKeys.length} property chat data items from localStorage`);
    
    // Clear the current chat messages
    setChatMessages([]);
    
    // Clear the in-memory message map
    setPropertyMessagesMap({});
    
    toast.success('All property chat session data cleared');
    
    // Refresh the chat list
    fetchPropertyChats();
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleDeleteChat = async (chatId: number) => {
    // Add confirmation dialog
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      try {
        // Update status to "closed" instead of deleting
        await ChatService.updateConversationStatus(chatId, 'closed');
        
        // Remove from UI
        setPropertyChatsList(prev => prev.filter(chat => chat.conversation_id !== chatId));
        
        if (selectedChat && selectedChat.conversation_id === chatId) {
          setSelectedChat(null);
          setChatMessages([]);
        }
        
        toast.success('Chat removed from list');
      } catch (error) {
        console.error('Failed to delete chat:', error);
        toast.error('Failed to delete chat. Please try again.');
      }
    }
  };

  // Filter chats based on search term
  const filteredChats = propertyChatsList.filter(chat => {
    const propertyAddress = getPropertyDisplayName(chat).toLowerCase();
    return propertyAddress.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-full">
      {/* Property List Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Property Chats</h2>
            <div className="flex space-x-2">
              <button 
                onClick={fetchPropertyChats}
                className="text-emerald-600 hover:text-emerald-800"
                title="Refresh chats"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button 
                onClick={clearAllPropertyChatData}
                className="text-red-600 hover:text-red-800"
                title="Clear all chat data (for testing)"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Spinner size="md" />
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <button
                key={chat.conversation_id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 border-b hover:bg-gray-50 text-left ${
                  selectedChat?.conversation_id === chat.conversation_id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    {chat.property_details.thumbnail ? (
                      <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={chat.property_details.thumbnail} 
                          alt={chat.property_details.address}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // If image fails to load, replace with a fallback icon
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="h-12 w-12 bg-gray-200 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                    <Home className="h-5 w-5 text-emerald-600 mt-1" />
                    )}
                    <div>
                      <h3 className="font-medium">{getPropertyDisplayName(chat)}</h3>
                      <p className="text-sm text-gray-500">{chat.property_details.price}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {chat.last_message.content}
                      </p>
                    </div>
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No property chats found.</p>
              <p className="mt-2 text-xs">
                Start a conversation from a property page to see it here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Enhanced Chat Header with Actions */}
            <div className="shrink-0 p-4 bg-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="font-medium">{getPropertyDisplayName(selectedChat)}</h2>
                    <p className="text-sm text-gray-500">{selectedChat.property_details.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewProperty(selectedChat.property_id)}
                    className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                    title="View Property"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteChat(selectedChat.conversation_id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete Chat History"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length > 0 ? (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id || `msg-${Date.now()}-${Math.random()}`}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-50 border shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <CircleUserRound className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">
                            Mia
                          </span>
                        </div>
                      )}
                      <div className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}>
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                      </div>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="shrink-0 p-4 bg-white border-t">
              <div className="flex space-x-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a property to view the conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyChats; 