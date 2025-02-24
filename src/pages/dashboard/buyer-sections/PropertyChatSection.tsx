import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_CONFIG } from '../../../config/api';
import { ChatMessage, ChatResponse } from '../../../types/chat';
import ReactMarkdown from 'react-markdown';

interface PropertyChatSectionProps {
  propertyId: string;
  sellerId: string;
}

const PropertyChatSection: React.FC<PropertyChatSectionProps> = ({ propertyId, sellerId }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.PROPERTY}`;
      
      const payload = {
        message: inputMessage,
        session_id: sessionId,
        user_id: user?.uid,
        property_id: propertyId,
        role: 'buyer',
        counterpart_id: sellerId
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: ChatResponse = await response.json();

      if (data.session_id) {
        setSessionId(data.session_id);
      }

      setMessages(prev => [
        ...prev,
        { 
          id: Date.now().toString(), 
          role: 'user', 
          content: inputMessage,
          timestamp: new Date().toISOString()
        },
        { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: data.message,
          timestamp: new Date().toISOString()
        }
      ]);

      setInputMessage('');

    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
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
              <ReactMarkdown
                components={{
                  li: ({node, children, ...props}) => <li className="list-disc ml-4" {...props}>{children}</li>,
                  strong: ({node, children, ...props}) => <span className="font-bold" {...props}>{children}</span>,
                  p: ({node, children, ...props}) => <p className="m-0" {...props}>{children}</p>
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PropertyChatSection; 