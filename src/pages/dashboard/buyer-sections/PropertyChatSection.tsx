import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_CONFIG } from '../../../config/api';
import { ChatMessage, ChatResponse } from '../../../types/chat';
import ReactMarkdown from 'react-markdown';
import { Home, ExternalLink, Trash2, Send, RefreshCw, ArrowLeft } from 'lucide-react';
import ChatService from '../../../services/ChatService';
import PropertyService from '../../../services/PropertyService';
import { PropertyDetail } from '../../../types/property';

interface PropertyChatSectionProps {
  propertyId: string;
  role: 'buyer' | 'seller';
}

const PropertyChatSection: React.FC<PropertyChatSectionProps> = ({ propertyId, role }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) return;
      
      try {
        setIsLoading(true);
        const propertyData = await PropertyService.getPropertyById(propertyId);
        setProperty(propertyData);

        // After getting property details, fetch chat history
        if (user?.uid) {
          try {
            // Get the session ID for this property
            const propertySessionId = localStorage.getItem(`property_chat_session_${propertyId}`);
            const propertyConversationId = localStorage.getItem(`property_chat_conversation_${propertyId}`);
            
            if (propertyConversationId) {
              const history = await ChatService.getChatHistory(parseInt(propertyConversationId), true);
              setMessages(history);
            }
            
            if (propertySessionId) {
              setSessionId(propertySessionId);
            }
          } catch (error) {
            console.error('Error fetching chat history:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [propertyId, user?.uid]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !propertyId || !user?.uid || !property) return;

    try {
      setIsSendingMessage(true);
      const messageToSend = inputMessage.trim();
      setInputMessage('');

      // Add user message to UI immediately
      const tempId = Date.now().toString();
      const newUserMessage: ChatMessage = {
        id: tempId,
        role: 'user',
        content: messageToSend,
        timestamp: new Date().toISOString(),
        property_id: propertyId
      };

      // Add loading message for MIA's response
      const loadingMessage: ChatMessage = {
        id: `${tempId}-loading`,
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date().toISOString(),
        property_id: propertyId,
        isLoading: true
      };

      setMessages(prev => [...prev, newUserMessage, loadingMessage]);

      // Get the session ID for this property
      const propertySessionId = localStorage.getItem(`property_chat_session_${propertyId}`);
      const isNewConversation = !propertySessionId;

      // Send message to API
      const payload = {
        message: messageToSend,
        session_id: isNewConversation ? undefined : propertySessionId,
        user_id: user.uid,
        property_id: propertyId,
        role: role,
        counterpart_id: role === 'buyer' ? (property.seller_id || 'unknown') : 'unknown'
      };

      const response = await ChatService.sendPropertyMessage(payload);

      // Store the session ID and conversation ID
      if (response.session_id) {
        localStorage.setItem(`property_chat_session_${propertyId}`, response.session_id);
        setSessionId(response.session_id);
      }
      if (response.conversation_id) {
        localStorage.setItem(`property_chat_conversation_${propertyId}`, response.conversation_id.toString());
      }

      // Replace loading message with AI response
      setMessages(prev => prev.map(msg => 
        msg.id === `${tempId}-loading`
          ? {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.message,
              timestamp: new Date().toISOString(),
              property_id: propertyId
            }
          : msg
      ));

    } catch (error) {
      console.error('Chat error:', error);
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.id.endsWith('-loading')
          ? {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again.',
              timestamp: new Date().toISOString(),
              property_id: propertyId
            }
          : msg
      ));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!propertyId) return;
    
    try {
      // Clear local storage
      localStorage.removeItem(`property_chat_session_${propertyId}`);
      localStorage.removeItem(`property_chat_conversation_${propertyId}`);
      
      // Clear state
      setMessages([]);
      setSessionId(null);
      
      // Optionally, you could add an API call here to delete the chat on the server
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={property?.main_image_url || '/placeholder-property.jpg'} 
                alt={property?.address.street}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {property?.address.street}
              </h2>
              <p className="text-sm text-gray-500">
                {property?.address.city}, {property?.address.postcode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Now with fixed height and scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 180px)' }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold">M</span>
                </div>
              )}
              <div 
                className={`${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white prose-invert' 
                    : 'bg-white text-gray-800'
                } rounded-lg p-3 max-w-[80%] prose shadow-sm`}
              >
                {msg.isLoading ? (
                  <div className="flex items-center gap-2">
                    <span>Thinking</span>
                    <span className="flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                  </div>
                ) : (
                  <ReactMarkdown
                    components={{
                      li: ({node, ...props}) => <li className="list-disc ml-4" {...props} />,
                      strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                      p: ({node, ...props}) => <p className="m-0" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
                {msg.timestamp && !msg.isLoading && (
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {msg.timestamp === 'now' ? 'Just now' : msg.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-start gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-semibold">M</span>
            </div>
            <div className="bg-white rounded-lg p-3 max-w-[80%] prose shadow-sm">
              <p className="text-gray-600 m-0">
                {role === 'buyer' 
                  ? "Hi! I'm MIA. You can ask me anything about this property or communicate with the seller here."
                  : "Hi! I'm MIA. You can ask me anything about this property or communicate with potential buyers here."}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-6 left-0 right-0 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 w-full md:w-[800px] max-w-full mx-auto">
        <div 
          className="flex items-center p-4 gap-2 bg-white rounded-2xl border border-white/30 mx-4 md:mx-0"
          style={{ 
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06), 0 0 1px rgba(5, 150, 105, 0.2)' 
          }}
        >
          <input
            type="text"
            className="flex-1 bg-transparent focus:outline-none text-gray-700 min-w-0"
            placeholder="Ask Mia about anything"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSendingMessage}
          />
          <button
            onClick={handleSendMessage}
            className={`flex-shrink-0 ${isSendingMessage ? 'text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'}`}
            disabled={isSendingMessage}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M22 2L2 9L11 13L22 2ZM22 2L15 22L11 13L22 2Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyChatSection; 