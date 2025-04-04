import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ChatService from '../services/ChatService';
import Navigation from '../components/layout/Navigation';
import ReactMarkdown from 'react-markdown';
import ValuationForm from '../components/property/ValuationForm';
import { useMenu } from '../context/MenuContext';
import PageTitle from '../components/PageTitle';

// Interface for the notification
interface ComingSoonNotification {
  title: string;
  message: string;
  visible: boolean;
}

const MaisonLanding = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'bot';
    message: string;
  }>>([]);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  // Add state for the coming soon notification
  const [notification, setNotification] = useState<ComingSoonNotification | null>(null);
  const navigate = useNavigate();
  const { isMenuOpen } = useMenu();

  // Effect to handle the notification timeout
  useEffect(() => {
    if (notification?.visible) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);

    try {
      const response = await ChatService.sendMessage(userMessage, false);
      // Add bot response to chat history
      setChatHistory(prev => [...prev, { type: 'bot', message: response.message }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        message: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openValuationModal = () => {
    setIsValuationModalOpen(true);
  };

  const closeValuationModal = () => {
    setIsValuationModalOpen(false);
  };

  const navigateToListings = () => {
    navigate('/listings');
  };

  const handlePropertyGuideClick = () => {
    setNotification({
      title: "Property Guide",
      message: "Our comprehensive property guide is coming soon! Check back later for updates.",
      visible: true
    });
  };

  const handleMoreOptionsClick = () => {
    setNotification({
      title: "More Options",
      message: "Additional features are coming soon! We're working on making your experience even better.",
      visible: true
    });
  };

  // Function to close the notification manually
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <>
      <PageTitle title="Home" />
      <div className="min-h-screen flex flex-col">
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 bg-white">
          {/* Coming Soon Notification */}
          {notification && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
              onClick={closeNotification}
            >
              <div 
                className="bg-white rounded-lg p-6 w-full max-w-md relative mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={closeNotification}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Modal content */}
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-emerald-600 text-xl">⏳</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-gray-600">{notification.message}</p>
                </div>
              </div>
            </div>
          )}

          {chatHistory.length === 0 && !isMenuOpen && (
            <h1 className="text-4xl font-bold text-gray-900 mb-16 text-center">
              Property Done The Intelligent Way
            </h1>
          )}

          {/* Chat Container */}
          {!isMenuOpen && (
            <div className="w-full max-w-2xl">
              {/* Chat History */}
              {(chatHistory.length > 0 || isLoading) && (
                <div className="mb-4 bg-white border rounded-lg w-full">
                  <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((chat, index) => (
                      <div
                        key={index}
                        className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {chat.type === 'bot' && (
                          <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                            <span className="text-emerald-700 font-semibold">M</span>
                          </div>
                        )}
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 prose ${
                            chat.type === 'user' 
                              ? 'bg-emerald-600 text-white prose-invert' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <ReactMarkdown
                            components={{
                              li: ({node, ...props}) => <li className="list-disc ml-4" {...props} />,
                              strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                              p: ({node, ...props}) => <p className="m-0" {...props} />
                            }}
                          >
                            {chat.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start w-full">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-600 text-sm font-medium">M</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Mia</p>
                              <p className="text-xs text-gray-500">AI Assistant</p>
                            </div>
                          </div>
                          <span className="animate-pulse">...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <button 
                  onClick={navigateToListings}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <span className="text-emerald-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Find property</span>
                </button>
                <button 
                  onClick={openValuationModal}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <span className="text-emerald-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Get valuation</span>
                </button>
                <button 
                  onClick={handlePropertyGuideClick}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <span className="text-emerald-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Property guide</span>
                </button>
                <button 
                  onClick={handleMoreOptionsClick}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <span className="text-emerald-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>More options</span>
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask Mia about buying, selling, or property management..."
                  className="w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Send className="h-5 w-5 text-emerald-600" />
                </button>
              </form>
            </div>
          )}

          {/* Disclaimer */}
          {!isMenuOpen && (
            <p className="text-gray-500 text-sm mt-8">
              Mia can make mistakes. Check important info.
            </p>
          )}
        </main>

        {/* Valuation Modal */}
        <ValuationForm 
          isOpen={isValuationModalOpen} 
          onClose={closeValuationModal} 
        />
      </div>
    </>
  );
};

export default MaisonLanding;
