import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useLocation } from 'react-router-dom';

interface ChatHistory {
  id: string;
  question: string;
  timestamp: string;
  isActive?: boolean;
  conversation_id?: number;
}

interface PreviousChatsProps {
  onSelectChat: (chat: ChatHistory) => void;
  selectedChatId?: string;
}

const PreviousChats: React.FC<PreviousChatsProps> = ({ onSelectChat, selectedChatId }) => {
  const { chatHistory, isLoadingChats, refreshChatHistory } = useChat();
  const location = useLocation();
  
  // Check if we're on the property chats page
  const isPropertyChatsPage = location.pathname.includes('/property-chats');
  
  // If we're on the property chats page, don't allow selecting general chats
  const handleSelectChat = (chat: ChatHistory) => {
    if (!isPropertyChatsPage) {
      onSelectChat(chat);
    }
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600">Previous Chats</h3>
        <button 
          onClick={() => refreshChatHistory()} 
          className="text-xs text-emerald-600 hover:text-emerald-700"
          disabled={isLoadingChats}
        >
          {isLoadingChats ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {isLoadingChats ? (
        <div className="flex flex-col gap-2 py-4">
          <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ) : chatHistory.length > 0 ? (
        <div className="space-y-2 overflow-y-auto flex-grow pr-1">
          {chatHistory.map((chat: ChatHistory) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`w-full text-left p-2 rounded-lg hover:bg-gray-50 group ${
                selectedChatId === chat.id ? 'bg-gray-50' : ''
              } ${isPropertyChatsPage ? 'pointer-events-none opacity-70' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-emerald-700">M</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{chat.question}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{chat.timestamp}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 py-2 text-center">
          <p>No previous chats found.</p>
          <p className="text-xs mt-1">Start a conversation with Mia!</p>
        </div>
      )}
    </div>
  );
};

export default PreviousChats; 