import React from 'react';

interface AIChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`
        fixed bottom-4 right-4 
        bg-white rounded-lg shadow-lg 
        transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      {/* Chat Content */}
      <div className="p-4 h-96 overflow-y-auto">
        {/* Chat messages will go here */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full p-2 border rounded-lg"
        />
      </div>
    </div>
  );
};

export default AIChatBox;
