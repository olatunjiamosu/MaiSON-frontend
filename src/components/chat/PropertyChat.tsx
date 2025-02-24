import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../../types/chat';

interface PropertyChatProps {
  message: ChatMessage;
}

const PropertyChat: React.FC<PropertyChatProps> = ({ message }) => {
  return (
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
  );
};

export default PropertyChat; 