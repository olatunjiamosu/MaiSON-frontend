import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/api';
import { ChatMessage, ChatResponse, GeneralChatPayload, PropertyChatPayload } from '../../types/chat';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../context/ChatContext';

interface PersistentChatProps {
  hide?: boolean;
  isDashboard?: boolean;
  propertyId?: string;
  counterpartId?: string;
  role?: 'buyer' | 'seller';
}

const PersistentChat: React.FC<PersistentChatProps> = ({ 
  hide = false, 
  isDashboard = false,
  propertyId,
  counterpartId,
  role 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const { addConversation } = useChat();
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if we're on the property chats page
  useEffect(() => {
    const checkPropertyChatsPage = () => {
      const onPropertyChatsPage = localStorage.getItem('on_property_chats_page') === 'true';
      if (onPropertyChatsPage) {
        // If we're on the property chats page, hide this component
        setIsExpanded(false);
      }
    };

    // Check initially
    checkPropertyChatsPage();

    // Set up a listener for storage events
    const handleStorageChange = () => {
      checkPropertyChatsPage();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Add a loading message for the assistant's response
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Generating response...',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    // Immediately update UI with user message and loading state
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsExpanded(true);
    setIsGeneratingResponse(true);

    try {
      // Always use general chat endpoint for persistent chat
      const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.GENERAL}`;
      
      const basePayload = {
        message: userMessage.content,
        session_id: sessionId,
        user_id: user?.uid
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basePayload),
      });

      const data: ChatResponse = await response.json();

      if (data.session_id) {
        setSessionId(data.session_id);
      }

      // Replace the loading message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? {
                id: msg.id,
                role: 'assistant' as const,
                content: data.message,
                timestamp: new Date().toISOString()
              }
            : msg
        )
      );

      if (data.conversation_id) {
        addConversation(userMessage.content, data.conversation_id);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Replace the loading message with an error message
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? {
                id: msg.id,
                role: 'assistant' as const,
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
              }
            : msg
        )
      );
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  // Check if we should hide this component
  const onPropertyChatsPage = localStorage.getItem('on_property_chats_page') === 'true';
  if (hide || onPropertyChatsPage) return null;

  return (
    <div 
      ref={chatRef} 
      className={`${
        isDashboard 
          ? 'fixed bottom-0 left-0 right-0 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2' 
          : 'fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2'
      } w-full md:w-[800px] max-w-full mx-auto`}
      style={{ zIndex: 50, background: 'transparent' }}
    >
      {isExpanded && messages.length > 0 && (
        <div className="bg-white rounded-t-2xl shadow-lg border mb-4 flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold">M</span>
              </div>
              <div>
                <h3 className="font-semibold">Mia</h3>
                <p className="text-sm text-gray-500">AI Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 space-y-4 overflow-y-auto">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                    <span className="text-emerald-700 font-semibold">M</span>
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-lg p-3 prose ${
                    message.role === 'user' 
                      ? 'bg-emerald-600 text-white prose-invert'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center">
                      <span className="mr-2">Generating response</span>
                      <span className="animate-pulse">...</span>
                    </div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        li: ({node, ...props}) => <li className="list-disc ml-4" {...props} />,
                        strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                        p: ({node, ...props}) => <p className="m-0" {...props} />
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        className="flex items-center p-4 gap-2 bg-white rounded-2xl border border-white/30 mx-4 md:mx-0"
        style={{ 
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06), 0 0 1px rgba(5, 150, 105, 0.2)' 
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Mia about anything"
          className="flex-1 bg-transparent focus:outline-none text-gray-700 min-w-0"
          disabled={isGeneratingResponse}
        />
        <button
          onClick={handleSendMessage}
          className={`flex-shrink-0 ${isGeneratingResponse ? 'text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'}`}
          disabled={isGeneratingResponse}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-current">
            <path d="M22 2L2 9L11 13L22 2ZM22 2L15 22L11 13L22 2Z" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PersistentChat; 