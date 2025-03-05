import React, { useState, useEffect } from 'react';
import { Home, CircleUserRound, Send, Search, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatService from '../../../services/ChatService';
import { useAuth } from '../../../context/AuthContext';
import { ChatMessage } from '../../../types/chat';
import ReactMarkdown from 'react-markdown';

interface PropertyChatItem {
  conversation_id: number;
  property_id: string;
  property_details: {
    address: string;
    price: string;
    images?: string[];
    seller_id?: string;
  };
  last_message: {
    content: string;
    timestamp: string;
  };
  unread_count: number;
  status: 'active' | 'pending' | 'closed';
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

  // Fetch user's property conversations when component mounts
  useEffect(() => {
    const fetchPropertyChats = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const conversations = await ChatService.getUserConversations(user.uid, 'buyer');
        
        // Filter to only include property conversations
        const propertyChats = conversations.filter((convo: any) => 
          convo.conversation_type === 'property' && convo.property_details
        );
        
        setPropertyChatsList(propertyChats);
      } catch (error) {
        console.error('Failed to fetch property chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyChats();
  }, [user]);

  // Fetch chat messages when a property is selected
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!selectedChat) return;
      
      try {
        const messages = await ChatService.getChatHistory(selectedChat.conversation_id, true); // true for property chat
        setChatMessages(messages);
        
        // Mark as read logic could be implemented here
      } catch (error) {
        console.error('Failed to fetch chat messages:', error);
      }
    };

    fetchChatMessages();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user?.uid) return;
    
    // Optimistically add message to UI
    const tempId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setMessage('');
    
    try {
      // Send message to API
      const response = await ChatService.sendPropertyMessage({
        message: message,
        user_id: user.uid,
        property_id: selectedChat.property_id,
        role: 'buyer',
        counterpart_id: selectedChat.property_details.seller_id || '',
        session_id: ChatService.getSessionId() || undefined
      });
      
      // Add AI response to messages
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      
      // Update the last message in the property chats list
      setPropertyChatsList(prev => 
        prev.map(chat => 
          chat.conversation_id === selectedChat.conversation_id 
            ? {
                ...chat,
                last_message: {
                  content: message,
                  timestamp: new Date().toISOString()
                }
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistically added message on error
      setChatMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
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
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  // Filter chats based on search term
  const filteredChats = propertyChatsList.filter(chat => 
    chat.property_details.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Property List Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
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
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
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
                    <Home className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <h3 className="font-medium">{chat.property_details.address}</h3>
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
              No property chats found.
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
                    <h2 className="font-medium">{selectedChat.property_details.address}</h2>
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
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <CircleUserRound className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">
                            MaiSON AI
                          </span>
                        </div>
                      )}
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                      <p className="text-xs text-gray-400 mt-1">
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