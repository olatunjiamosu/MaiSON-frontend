import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PersistentChatProps {
  hide?: boolean;
  isDashboard?: boolean;
}

const PersistentChat: React.FC<PersistentChatProps> = ({ hide = false, isDashboard = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Add user message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage
      }]);
      
      // Add assistant response (mock)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      }]);
      
      setInputMessage('');
      setIsExpanded(true);
    }
  };

  if (hide) return null;

  return (
    <div 
      ref={chatRef} 
      className={`${
        isDashboard 
          ? 'fixed bottom-0 left-0 right-0 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2' 
          : 'fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2'
      } w-full md:w-[800px] max-w-full mx-auto`}
    >
      {isExpanded && messages.length > 0 && (
        <div className="bg-white rounded-t-2xl shadow-lg border mb-4 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
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
          
          <div className="p-4 space-y-4">
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
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border">
        <div className="flex items-center p-4 gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Mia about anything"
            className="flex-1 bg-transparent focus:outline-none text-gray-700 min-w-0"
          />
          <button
            onClick={handleSendMessage}
            className="flex-shrink-0 text-emerald-600 hover:text-emerald-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
              <path d="M22 2L2 9L11 13L22 2ZM22 2L15 22L11 13L22 2Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersistentChat; 