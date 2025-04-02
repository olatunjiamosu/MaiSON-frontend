import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  FileText,
  Calendar,
  Heart,
  ClipboardList,
  MessageCircle,
  LogOut,
  Menu,
  List,
  X,
  SwitchCamera,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import PersistentChat from '../../components/chat/PersistentChat';
import ChatService from '../../services/ChatService';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../../context/ChatContext';
import { API_CONFIG } from '../../config/api';
import ReactMarkdown from 'react-markdown';
import PreviousChats from '../../components/chat/PreviousChats';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import PageTitle from '../../components/PageTitle';

// Import Sections
import ListingsSection from './buyer-sections/ListingsSection';
import SavedPropertiesSection from './buyer-sections/SavedPropertiesSection';
import ViewingsSection from './buyer-sections/ViewingsSection';
import ApplicationsSection from './buyer-sections/ApplicationsSection';
import PropertyChats from './buyer-sections/PropertyChats';
import DocumentsSection from './buyer-sections/DocumentsSection';
import SavedSearchesSection from './buyer-sections/SavedSearchesSection';

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

const ListingsDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('listings');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get chat history from context
  const { chatHistory, isLoadingChats, addConversation, refreshChatHistory } = useChat();
  
  // Get auth context
  const auth = useAuth();
  const { user, userRole } = auth;

  // User data from auth context
  const userData = {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
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
    if (location.pathname.includes('/applications')) {
      setActiveSection('applications');
    } else if (location.pathname.includes('/saved-searches')) {
      setActiveSection('saved-searches');
    } else if (location.pathname.includes('/saved')) {
      setActiveSection('saved');
    } else if (location.pathname.includes('/viewings')) {
      setActiveSection('viewings');
    } else if (location.pathname.includes('/property-chats') || location.pathname.includes('/messages')) {
      setActiveSection('messages');
      // Clear selected chat when navigating to property chats
      setSelectedChat(null);
    } else if (location.pathname === '/dashboard/listings') {
      setActiveSection('listings');
    }
  }, [location.pathname]);

  // Fetch chat messages when a chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.conversation_id) {
      // Don't store selected chat in localStorage anymore
      
      const fetchChatMessages = async () => {
        setIsLoadingChatMessages(true);
        try {
          // First check if we have messages in localStorage
          const storedMessages = localStorage.getItem(`chat_messages_${selectedChat.conversation_id}`);
          
          if (storedMessages) {
            try {
              const parsedMessages = JSON.parse(storedMessages);
              setSelectedChatMessages(parsedMessages);
              setIsLoadingChatMessages(false);
              
              // Scroll to the bottom when messages are loaded
              if (chatMessagesRef.current) {
                chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
              }
              
              // Optionally, still fetch from API in the background to ensure we have the latest
              fetchFromApi();
              return;
            } catch (e) {
              console.error('Failed to parse stored chat messages:', e);
              // Continue to API fetch if parsing fails
            }
          }
          
          // If no stored messages or parsing failed, fetch from API
          fetchFromApi();
          
        } catch (error) {
          console.error('Failed to fetch chat messages:', error);
          // Fallback display logic remains the same
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
              content: 'Sorry, I couldn\'t retrieve the full conversation history. Please try again later.',
              timestamp: 'Just now'
            }
          ]);
          setIsLoadingChatMessages(false);
        }
      };
      
      // Helper function to fetch from API
      const fetchFromApi = async () => {
        try {
          // Using non-null assertion since we've already checked that conversation_id exists
          const messages = await ChatService.getChatHistory(selectedChat.conversation_id!, false);
          setSelectedChatMessages(messages);
          
          // Store the fetched messages in localStorage
          localStorage.setItem(`chat_messages_${selectedChat.conversation_id}`, JSON.stringify(messages));
        } catch (error) {
          console.error('API fetch failed:', error);
          // If API fetch fails but we already have messages from localStorage, keep those
          // If not, the fallback in the outer catch will apply
        } finally {
          setIsLoadingChatMessages(false);
          // Scroll to the bottom when messages are loaded
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
          }
        }
      };

      fetchChatMessages();
    } else if (selectedChat) {
      // Clear stored selected chat if it doesn't have a conversation_id
      localStorage.removeItem('selected_chat');
    }
  }, [selectedChat]);

  // Add a useEffect to scroll to the bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [selectedChatMessages]);

  // Add function to handle dashboard switch
  const handleSwitchDashboard = () => {
    navigate('/select-dashboard');
    toast.success('Switching dashboards');
  };

  // Update the logout function
  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      // Clear all chat-related data from localStorage
      localStorage.removeItem('chat_session_id');
      localStorage.removeItem('chat_history');
      localStorage.removeItem('selected_chat');
      
      // Clear all conversation messages
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chat_messages_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear auth token and redirect
      localStorage.removeItem('token');
      
      // Use the auth context's logout method if it exists
      if (auth && auth.logout) {
        auth.logout()
          .then(() => {
            navigate('/'); // Navigate to home page instead of login
          })
          .catch((error: Error) => {
            console.error("Logout error:", error);
            navigate('/'); // Navigate to home page anyway
          });
      } else {
        navigate('/'); // Navigate to home page
      }
    }
  };

  const handleLogoClick = () => {
    // Clear authentication
    localStorage.removeItem('token');
    // Navigate to landing page
    navigate('/');
  };

  // Add console.log to debug
  console.log('Rendering ListingsDashboard');

  // Compute if we're in the messages section to hide the persistent chat
  const isMessagesSection = activeSection === 'messages' || 
                           location.pathname.includes('/property-chats') || 
                           location.pathname.includes('/messages');

  // Add a function to handle sending a message in the modal
  const handleSendModalMessage = async () => {
    if (!modalInputMessage.trim()) return;

    setIsSendingMessage(true);
    
    // Create a temporary message to display immediately
    const tempMessage: ChatMessageDisplay = {
      id: Date.now().toString(),
      role: 'user',
      content: modalInputMessage,
      timestamp: new Date().toISOString()
    };

    setSelectedChatMessages(prev => [...prev, tempMessage]);
    setModalInputMessage('');

    try {
      let response;
      
      if (selectedChat && selectedChat.conversation_id) {
        // If continuing an existing conversation, use the conversation ID
        response = await ChatService.sendMessage(
          tempMessage.content, 
          false, 
          selectedChat.conversation_id
        );
      } else {
        // If starting a new conversation
        response = await ChatService.sendMessage(tempMessage.content, false);
        
        // Create a new selected chat if one doesn't exist
        if (!selectedChat) {
          const newChat: ChatHistory = {
            id: response.conversation_id.toString(),
            conversation_id: response.conversation_id,
            question: tempMessage.content,
            timestamp: formatDistanceToNow(new Date(), { addSuffix: true })
          };
          setSelectedChat(newChat);
          
          // Don't store the selected chat in localStorage anymore
        }
      }

      // Add the assistant's response
      const assistantMessage: ChatMessageDisplay = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...selectedChatMessages, assistantMessage];
      setSelectedChatMessages(updatedMessages);
      
      // Store messages in localStorage for the current conversation
      if (selectedChat?.conversation_id || response.conversation_id) {
        const conversationId = selectedChat?.conversation_id || response.conversation_id;
        localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(updatedMessages));
      }
      
      // Update the chat history in context
      addConversation(tempMessage.content, response.conversation_id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
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
      
      // Scroll to the bottom after sending
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  return (
    <React.Fragment>
      {/* Dynamic PageTitle based on active section */}
      {activeSection === 'listings' && <PageTitle title="Property Listings | Listings Dashboard" />}
      {activeSection === 'saved' && <PageTitle title="Saved Properties | Listings Dashboard" />}
      {activeSection === 'messages' && <PageTitle title="Property Chats | Listings Dashboard" />}
      {activeSection === 'viewings' && <PageTitle title="Viewings | Listings Dashboard" />}
      {activeSection === 'applications' && <PageTitle title="Offers | Listings Dashboard" />}
      {activeSection === 'documents' && <PageTitle title="Documents | Listings Dashboard" />}

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-30 flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Home className="h-7 w-7 text-emerald-600" />
                <span className="text-2xl font-bold tracking-tight">
                  <span>M</span>
                  <span className="text-emerald-600">ai</span>
                  <span>SON</span>
                </span>
              </div>
            </div>
          </div>

          {/* Back to Dashboard Button */}
          <div className="p-4 border-b">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-emerald-600 hover:text-emerald-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              <span className="text-[0.9375rem] font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <NavItem
              icon={<List />}
              label="All Listings"
              active={activeSection === 'listings'}
              onClick={() => {
                setActiveSection('listings');
                navigate('/dashboard/listings');
              }}
              path="/dashboard/listings"
            />
            <NavItem
              icon={<Search />}
              label="Saved Searches"
              active={activeSection === 'saved-searches'}
              onClick={() => {
                setActiveSection('saved-searches');
                navigate('/dashboard/listings/saved-searches');
              }}
              path="/dashboard/listings/saved-searches"
            />
            <NavItem
              icon={<Heart />}
              label="Saved Properties"
              active={activeSection === 'saved'}
              onClick={() => {
                setActiveSection('saved');
                navigate('/dashboard/listings/saved');
              }}
              path="/dashboard/listings/saved"
            />
            <NavItem
              icon={<MessageCircle />}
              label="Property Chats"
              active={activeSection === 'messages'}
              onClick={() => {
                setActiveSection('messages');
                navigate('/dashboard/listings/property-chats');
              }}
              path="/dashboard/listings/property-chats"
            />
            <NavItem
              icon={<Calendar />}
              label="Viewings"
              active={activeSection === 'viewings'}
              onClick={() => {
                setActiveSection('viewings');
                navigate('/dashboard/listings/viewings');
              }}
              path="/dashboard/listings/viewings"
            />
            <NavItem
              icon={<ClipboardList />}
              label="Offers"
              active={activeSection === 'applications'}
              onClick={() => setActiveSection('applications')}
              path="/dashboard/listings/applications"
            />
            <NavItem
              icon={<FileText />}
              label="Documents"
              active={activeSection === 'documents'}
              onClick={() => setActiveSection('documents')}
              path="/dashboard/listings/documents"
            />
          </nav>
        </div>

        {/* Add overlay for closing sidebar on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative md:ml-64">
          <main className={`flex-1 overflow-y-auto ${
            activeSection === 'messages' ? 'p-0' : 'p-8'
          }`}>
            <div className={`${
              activeSection === 'messages' ? 'w-full h-full' : 'max-w-7xl mx-auto'
            }`}>
              <Routes>
                <Route
                  index
                  element={<ListingsSection />}
                />
                <Route path="saved-searches" element={<SavedSearchesSection />} />
                <Route path="saved" element={<SavedPropertiesSection />} />
                <Route path="viewings" element={<ViewingsSection />} />
                <Route path="messages" element={<PropertyChats />} />
                <Route path="property-chats" element={<PropertyChats />} />
                <Route path="applications" element={<ApplicationsSection />} />
                <Route path="documents" element={<DocumentsSection />} />
              </Routes>
            </div>
            {/* Add padding at the bottom to ensure content isn't hidden behind the chat input */}
            {!isMessagesSection && <div className="pb-28 md:pb-12"></div>}
          </main>
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <PersistentChat hide={isMessagesSection} isDashboard={true} />
          </div>
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
            className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pb-20"
            onClick={() => setSelectedChat(null)}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-[800px] max-h-[70vh] flex flex-col mx-auto" 
              style={{ marginLeft: 'calc(256px + 2rem)', marginRight: '2rem' }}
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
    </React.Fragment>
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
    if (onClick) onClick();
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

export default ListingsDashboard;