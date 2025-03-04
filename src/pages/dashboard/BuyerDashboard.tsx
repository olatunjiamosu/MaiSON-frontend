import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  FileText,
  Settings,
  Calendar,
  Bell,
  Heart,
  ClipboardList,
  MessageCircle,
  LogOut,
  Menu,
  List,
  Handshake,
  X,
} from 'lucide-react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import PersistentChat from '../../components/chat/PersistentChat';
import ChatService from '../../services/ChatService';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../../context/ChatContext';
import { API_CONFIG } from '../../config/api';
import ReactMarkdown from 'react-markdown';

// Import Sections (from `buyer-sections`)
import ListingsSection from './buyer-sections/ListingsSection';
//import MatchesSection from './buyer-sections/MatchesSection';
import SavedPropertiesSection from './buyer-sections/SavedPropertiesSection';
import ViewingsSection from './buyer-sections/ViewingsSection';
import ApplicationsSection from './buyer-sections/ApplicationsSection';
import PropertyChats from './buyer-sections/PropertyChats';
//import NotificationsSection from './buyer-sections/NotificationsSection';
//import PreferencesSection from './buyer-sections/PreferencesSection';
import DocumentsSection from './buyer-sections/DocumentsSection';

// Add this interface near the top
interface ChatHistory {
  id: string;
  question: string;
  timestamp: string;
  isActive?: boolean;
  conversation_id?: number;
}

// Add a new interface for chat messages
interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const mockProperties = [
  {
    id: '1',
    image: 'https://example.com/image1.jpg',
    price: '£800,000',
    road: '123 Park Avenue',
    city: 'London',
    postcode: 'SE22 9QA',
    beds: 2,
    baths: 2,
    reception: 1,
    sqft: 1200,
    propertyType: 'Terraced',
    epcRating: 'C',
    lat: 51.5074,
    lng: -0.1278,
  },
  // Add more properties as needed
];

const BuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('listings');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get chat history from context
  const { chatHistory, isLoadingChats, addConversation } = useChat();

  // Simulating user data (Replace with real auth system)
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  // Add state for selected chat
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState<ChatMessageDisplay[]>([]);
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false);

  // Add state for the new message input in the modal
  const [modalInputMessage, setModalInputMessage] = useState('');

  // Add a ref for the chat messages container
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Add state for sending message loading
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Update active section based on location
  useEffect(() => {
    if (location.pathname.includes('/saved')) {
      setActiveSection('saved');
    } else if (location.pathname.includes('/viewings')) {
      setActiveSection('viewings');
    } else if (location.pathname === '/buyer-dashboard') {
      setActiveSection('listings');
    }
  }, [location.pathname]);

  // Fetch chat messages when a chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.conversation_id) {
      const fetchChatMessages = async () => {
        setIsLoadingChatMessages(true);
        try {
          // Using non-null assertion since we've already checked that conversation_id exists
          const messages = await ChatService.getChatHistory(selectedChat.conversation_id!, false);
          setSelectedChatMessages(messages);
        } catch (error) {
          console.error('Failed to fetch chat messages:', error);
          setSelectedChatMessages([
            {
              id: '1',
              role: 'user',
              content: selectedChat.question,
              timestamp: selectedChat.timestamp
            },
            {
              id: '2',
              role: 'assistant',
              content: 'I apologise, but I could not retrieve the full conversation history. How can I help you today?',
              timestamp: 'now'
            }
          ]);
        } finally {
          setIsLoadingChatMessages(false);
        }
      };
      
      fetchChatMessages();
    } else if (selectedChat) {
      // For mock data without conversation_id
      setSelectedChatMessages([
        {
          id: '1',
          role: 'user',
          content: selectedChat.question,
          timestamp: selectedChat.timestamp
        },
        {
          id: '2',
          role: 'assistant',
          content: 'This is a mock conversation. In the real app, you would see the full conversation history here.',
          timestamp: 'now'
        }
      ]);
    }
  }, [selectedChat]);

  // Add a useEffect to scroll to the bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [selectedChatMessages]);

  // Logout Function ✅
  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleLogoClick = () => {
    // Clear authentication
    localStorage.removeItem('token');
    // Navigate to landing page
    navigate('/');
  };

  // Add console.log to debug
  console.log('Rendering BuyerDashboard');
  console.log('Mock Properties:', mockProperties);

  const isMessagesSection = location.pathname.includes('/chats') || 
                           location.pathname.includes('/messages');

  // Add a function to handle sending a message in the modal
  const handleSendModalMessage = async () => {
    if (!modalInputMessage.trim() || !selectedChat?.conversation_id || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      
      // Add the user message to the UI immediately for better UX
      const userMessage: ChatMessageDisplay = {
        id: Date.now().toString(),
        role: 'user',
        content: modalInputMessage,
        timestamp: new Date().toISOString()
      };
      
      setSelectedChatMessages(prev => [...prev, userMessage]);
      
      // Clear the input right away for better UX
      const messageToSend = modalInputMessage;
      setModalInputMessage('');
      
      // Call the API to send the message
      const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${API_CONFIG.CHAT.GENERAL}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_id: selectedChat.conversation_id,
          user_id: "guest" // Use a default guest ID since we're not using Firebase auth here
        }),
      });

      const data = await response.json();
      
      // Add the assistant's response to the UI
      const assistantMessage: ChatMessageDisplay = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      };
      
      setSelectedChatMessages(prev => [...prev, assistantMessage]);
      
      // Update the conversation in the sidebar with the latest message
      addConversation(messageToSend, selectedChat.conversation_id);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add an error message
      const errorMessage: ChatMessageDisplay = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setSelectedChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-sm border-r transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-30 flex flex-col`}
      >
        {/* Logo & Menu Toggle */}
        <div className="p-4 border-b flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <Home className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">
              <span>M</span>
              <span className="text-emerald-600">ai</span>
              <span>SON</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <NavItem
            icon={<List />}
            label="All Listings"
            active={activeSection === 'listings'}
            onClick={() => setActiveSection('listings')}
            path="/buyer-dashboard"
          />
          {/* <NavItem
            icon={<Handshake />}
            label="Property Matches"
            active={activeSection === 'matches'}
            onClick={() => setActiveSection('matches')}
            path="/buyer-dashboard/matches"
          /> */}
          <NavItem
            icon={<Heart />}
            label="Saved Properties"
            active={activeSection === 'saved'}
            onClick={() => {
              setActiveSection('saved');
              navigate('/buyer-dashboard/saved');
            }}
            path="/buyer-dashboard/saved"
          />
          <NavItem
            icon={<MessageCircle />}
            label="Property Chats"
            active={activeSection === 'messages'}
            onClick={() => setActiveSection('messages')}
            path="/buyer-dashboard/messages"
          />
          <NavItem
            icon={<Calendar />}
            label="Viewings"
            active={activeSection === 'viewings'}
            onClick={() => {
              setActiveSection('viewings');
              navigate('/buyer-dashboard/viewings');
            }}
            path="/buyer-dashboard/viewings"
          />
          <NavItem
            icon={<ClipboardList />}
            label="Offers"
            active={activeSection === 'applications'}
            onClick={() => setActiveSection('applications')}
            path="/buyer-dashboard/applications"
          />
          {/* <NavItem
            icon={<Bell />}
            label="Notifications"
            active={activeSection === 'notifications'}
            onClick={() => setActiveSection('notifications')}
            path="/buyer-dashboard/notifications"
          /> */}
          {/* <NavItem
            icon={<Settings />}
            label="Preferences"
            active={activeSection === 'preferences'}
            onClick={() => setActiveSection('preferences')}
            path="/buyer-dashboard/preferences"
          /> */}
          <NavItem
            icon={<FileText />}
            label="Documents"
            active={activeSection === 'documents'}
            onClick={() => setActiveSection('documents')}
            path="/buyer-dashboard/documents"
          />
        </nav>

        {/* Mia Chat History */}
        <div className="px-4 py-3 border-t flex-grow flex flex-col overflow-hidden">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Previous Chats</h3>
          {isLoadingChats ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-2 overflow-y-auto flex-grow pr-1">
              {chatHistory.map((chat: ChatHistory) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 group"
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
            <div className="text-sm text-gray-500 py-2">
              No previous chats found. Start a conversation with Mia!
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="mt-auto border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">{user.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Add overlay for closing sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        activeSection === 'messages' ? '' : 'pb-24'  // Only add padding when not in messages
      } relative`}>
        <main className={`flex-1 overflow-y-auto ${
          activeSection === 'messages' ? 'p-0' : 'p-8'
        }`}>
          <div className={`${
            activeSection === 'messages' ? 'w-full h-full' : 'max-w-7xl mx-auto'
          }`}>
            <Routes>
              <Route
                index
                element={<ListingsSection initialProperties={mockProperties} />}
              />
              <Route path="saved" element={<SavedPropertiesSection />} />
              <Route path="viewings" element={<ViewingsSection />} />
              <Route path="messages" element={<PropertyChats />} />
              <Route path="applications" element={<ApplicationsSection />} />
              {/* <Route path="notifications" element={<NotificationsSection />} /> */}
              <Route path="documents" element={<DocumentsSection />} />
            </Routes>
          </div>
        </main>
        <PersistentChat hide={isMessagesSection} isDashboard={true} />
      </div>

      {/* Mobile Menu Trigger Button */}
      <button
        className="fixed bottom-20 right-4 md:hidden z-20 p-3 bg-emerald-600 text-white rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Selected Chat Modal */}
      {selectedChat && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setSelectedChat(null)}
        >
          <div 
            className="bg-white rounded-xl w-[800px] max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with title and close button */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedChat.question}</h2>
              <button 
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mia Profile Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold">M</span>
              </div>
              <div>
                <h3 className="font-semibold">Mia</h3>
                <p className="text-sm text-gray-500">AI Assistant</p>
              </div>
            </div>

            {/* Chat Content */}
            <div 
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {isLoadingChatMessages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-10 bg-gray-200 rounded w-3/4 ml-auto"></div>
                    <div className="h-20 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-200 rounded w-1/2 ml-auto"></div>
                    <div className="h-24 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : (
                selectedChatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold">M</span>
                      </div>
                    )}
                    <div 
                      className={`${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white prose-invert' 
                          : 'bg-gray-100 text-gray-800'
                      } rounded-lg p-3 max-w-[80%] prose`}
                    >
                      <ReactMarkdown
                        components={{
                          li: ({node, ...props}) => <li className="list-disc ml-4" {...props} />,
                          strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                          p: ({node, ...props}) => <p className="m-0" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area - Now active */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={modalInputMessage}
                  onChange={(e) => setModalInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendModalMessage()}
                  placeholder="Continue your conversation with Mia..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={isSendingMessage}
                />
                <button 
                  onClick={handleSendModalMessage}
                  className={`px-4 py-2 rounded-lg ${
                    isSendingMessage 
                      ? 'bg-emerald-400 text-white cursor-not-allowed' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  disabled={isSendingMessage}
                >
                  {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this interface before the NavItem component
interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  onClick?: () => void;
  path: string;
}

// Update the NavItem component with TypeScript types
const NavItem = ({ icon, label, active, onClick, path }: NavItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-emerald-50 text-emerald-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {React.cloneElement(icon, {
        className: `h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-500'}`,
      })}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default BuyerDashboard;
