import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import ChatService from '../../services/ChatService';
import { ChatResponse } from '../../types/chat';

// Add these interfaces at the top of the file
interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
}

const MaisonChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'bot',
      message: "Hi! I'm MaiSON, your AI assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = () => {
    if (typeof window !== 'undefined' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setError(null);
    setIsLoading(true);

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);

    try {
      const response: ChatResponse = await ChatService.sendMessage(userMessage);
      
      // Add bot response to chat
      setChatHistory(prev => [...prev, { type: 'bot', message: response.message }]);
    } catch (error) {
      setError('Sorry, I encountered an error. Please try again.');
      console.error('Failed to get chat response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div data-testid="chat-container" className={`fixed bottom-4 right-4 z-50 flex flex-col items-end`}>
      {isOpen ? (
        <div className="mb-4 bg-white rounded-lg shadow-lg overflow-hidden w-[320px]">
          {/* Chat Header */}
          <div className="bg-emerald-600 p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-medium">MaiSON</span>
              <span className="text-emerald-100 text-xs">Your property assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-emerald-100"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[400px] overflow-y-auto p-3 space-y-3">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${
                  chat.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.type === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">...</div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-600 p-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="p-2 text-emerald-600 hover:text-emerald-700 disabled:text-gray-400"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default MaisonChat;
