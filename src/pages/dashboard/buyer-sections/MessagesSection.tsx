import React, { useState } from 'react';
//import { Card } from '@/components/ui/card';
//import { Input } from '@/components/ui/input';
//import { Button } from '@/components/ui/button';
import { Home, CircleUserRound, Send, Search, Bot } from 'lucide-react';

const MessagesSection = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [message, setMessage] = useState('');

  // Example property chats
  const propertyChats = [
    {
      id: 1,
      address: '123 Park Avenue',
      price: '£450,000',
      lastMessage: 'What documents are needed for viewing?',
      unread: 2,
      messages: [
        {
          id: 1,
          sender: 'ai',
          content: 'Hello! I can help you with information about 123 Park Avenue. What would you like to know?',
          timestamp: '10:30 AM'
        },
        {
          id: 2,
          sender: 'user',
          content: 'What documents are needed for viewing?',
          timestamp: '10:31 AM'
        },
        {
          id: 3,
          sender: 'ai',
          content: 'For viewing 123 Park Avenue, you\'ll need to bring a photo ID and proof of funds. Would you like me to schedule a viewing for you?',
          timestamp: '10:32 AM'
        }
      ]
    },
    {
      id: 2,
      address: '45 Queen Street',
      price: '£375,000',
      lastMessage: 'Is the garden south-facing?',
      unread: 0,
      messages: [
        {
          id: 1,
          sender: 'ai',
          content: 'Welcome! I can assist you with information about 45 Queen Street.',
          timestamp: '09:15 AM'
        }
      ]
    }
  ];

  return (
    <div className="flex h-[calc(100vh-2rem)] max-h-[800px]">
      {/* Property List Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties"
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {propertyChats.map((property) => (
            <button
              key={property.id}
              onClick={() => setSelectedProperty(property)}
              className={`w-full p-4 border-b hover:bg-gray-50 text-left ${
                selectedProperty?.id === property.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-medium">{property.address}</h3>
                    <p className="text-sm text-gray-500">{property.price}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {property.lastMessage}
                    </p>
                  </div>
                </div>
                {property.unread > 0 && (
                  <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                    {property.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedProperty ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b">
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="font-medium">{selectedProperty.address}</h2>
                  <p className="text-sm text-gray-500">{selectedProperty.price}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedProperty.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <CircleUserRound className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">
                          MaiSON AI
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                </Button>
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

export default MessagesSection;