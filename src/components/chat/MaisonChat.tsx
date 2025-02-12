import React, { useState } from 'react';
import { Bot, Minimize2, Maximize2, Send } from 'lucide-react';

const MaisonChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'bot',
      message: 'Hi! I\'m MaiSON, your AI assistant. How can I help you today?'
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', message }]);
    
    // TODO: Add actual AI response logic
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: 'I understand you said: ' + message + '. How can I assist you further?'
      }]);
    }, 1000);

    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Modified Chat Button - removed bouncing prompt */}
      {!isOpen && (
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm text-gray-600 font-medium">Chat with me</span>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-emerald-600 text-white w-20 h-20 rounded-full shadow-lg hover:bg-emerald-700 
            transition-all hover:scale-110 flex items-center justify-center font-bold text-xl"
          >
            <span>M<span className="text-white">ai</span>SON</span>
          </button>
        </div>
      )}

      {/* Chat Window - Header modified */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 flex flex-col border">
          <div className="p-4 bg-emerald-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <span className="font-semibold">
                  <span>M</span>
                  <span className="text-emerald-100">ai</span>
                  <span>SON</span>
                </span>
                <span className="text-xs text-emerald-100">Your property assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-emerald-700 p-1 rounded"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-4 h-96 overflow-y-auto">
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
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSend}
                className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaisonChat; 