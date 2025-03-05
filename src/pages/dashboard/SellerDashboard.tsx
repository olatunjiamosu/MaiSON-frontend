import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Building,
  Plus,
  List,
  Calendar,
  MessageCircle,
  BarChart4,
  DollarSign,
  Bell,
  Settings,
  FileText,
  LogOut,
  Menu,
  Search,
  Filter,
  ArrowUpRight,
  X,
  TrendingUp,
  Clock,
  ChevronLeft,
  SwitchCamera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Routes, Route, useLocation, useParams, Link } from 'react-router-dom';
import PersistentChat from '../../components/chat/PersistentChat';
import ChatService from '../../services/ChatService';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../../context/ChatContext';
import { API_CONFIG } from '../../config/api';
import ReactMarkdown from 'react-markdown';
import PropertyService from '../../services/PropertyService';
// Import all section components
import MyPropertiesSection from './seller-sections/ListingsManagementSection';
import AddPropertySection from './seller-sections/AddPropertySection';
import OffersSection from './seller-sections/OffersSection';
import ViewingsSection from './seller-sections/ViewingRequestsSection';
//import MessagesSection from './seller-sections/PropertyChats';
//import AnalyticsSection from './seller-sections/AnalyticsSection';
//import MarketInsightsSection from './seller-sections/MarketInsightsSection';
//import NotificationsSection from './seller-sections/NotificationsSection';
import DocumentsSection from './seller-sections/DocumentsSection';
import AvailabilitySection from './seller-sections/AvailabilitySection';
import { PropertyDetail } from '../../types/property';
import { toast } from 'react-hot-toast';

// Add interfaces for the components
interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  onClick: () => void;
  path: string;
}

interface Property {
  id: string;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
  image: string;
  price: string;
  road: string;
  city: string;
  postcode: string;
  beds: number;
  baths: number;
  reception: number;
  sqft: number;
  propertyType: string;
  epcRating: string;
  viewings: number;
  favorites: number;
  inquiries: number;
  dateAdded: string;
}

interface ChatHistory {
  id: string;
  question: string;
  timestamp: string;
  isActive?: boolean;
  conversation_id?: number;
}

interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// Add a custom interface that extends PropertyDetail with status
interface PropertyDetailWithStatus extends PropertyDetail {
  status?: 'active' | 'pending' | 'sold' | 'withdrawn';
}

const SellerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('properties');
  const auth = useAuth();
  const { user, userRole } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<PropertyDetailWithStatus | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  
  const isMessagesSection = location.pathname.includes('/seller-dashboard/messages');

  // Get chat history from context
  const { chatHistory, isLoadingChats, addConversation } = useChat();

  // Mock user data
  const userData = {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
  };

  // Fetch property details when propertyId changes
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) return;
      
      setIsLoadingProperty(true);
      setPropertyError(null);
      
      try {
        const propertyData = await PropertyService.getPropertyById(propertyId);
        // Add a default status of 'active' to the property
        setProperty({
          ...propertyData,
          status: 'active', // Default status
          id: propertyData.id || propertyData.property_id || propertyId // Ensure we have the id regardless of API field name
        });
      } catch (error) {
        console.error('Error fetching property details:', error);
        setPropertyError('Failed to load property details. Please try again later.');
      } finally {
        setIsLoadingProperty(false);
      }
    };
    
    fetchPropertyDetails();
  }, [propertyId]);

  // Update active section when propertyId changes
  useEffect(() => {
    if (propertyId) {
      // When a property is selected, set the active section to 'offers' by default
      setActiveSection('offers');
    } else {
      // When no property is selected, reset to 'properties'
      setActiveSection('properties');
    }
  }, [propertyId]);

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
              content: 'I apologize, but I could not retrieve the full conversation history. How can I help you today?',
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

  const handleLogoClick = () => {
    // Navigate to landing page
    navigate('/');
  };

  const handleBackToProperties = () => {
    navigate('/seller-dashboard');
  };

  // Format price to GBP
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Add function to handle dashboard switch
  const handleSwitchDashboard = () => {
    navigate('/select-dashboard');
    toast.success('Switching dashboards');
  };

  // Add logout function
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
      
      // Use the auth context's logout method if it exists
      if (auth && auth.logout) {
        auth.logout()
          .then(() => {
            navigate('/login');
          })
          .catch((error: Error) => {
            console.error("Logout error:", error);
            navigate('/login'); // Navigate anyway
          });
      } else {
        navigate('/login');
      }
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
          <button
            className="md:hidden text-gray-500 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Switch Dashboard Button - Only visible to 'both' role users */}
        {userRole === 'both' && (
          <div className="px-4 py-3 border-b">
            <button
              onClick={handleSwitchDashboard}
              className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <SwitchCamera className="h-4 w-4 mr-2" />
              <span>Switch Dashboard</span>
            </button>
          </div>
        )}

        {/* Property Info (if property is loaded) */}
        {propertyId && property && (
          <div className="p-4 border-b">
            <button 
              onClick={handleBackToProperties}
              className="flex items-center text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Back to Properties</span>
            </button>
            <h2 className="font-semibold text-gray-900 truncate">
              {property.address.street}
            </h2>
            <p className="text-sm text-gray-500">
              {property.address.city}, {property.address.postcode}
            </p>
            <div className="mt-2 flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${property.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  property.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'}`}
              >
                {property.status || 'Active'}
              </span>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <NavItem
            icon={<Building />}
            label="My Properties"
            active={activeSection === 'properties'}
            onClick={() => navigate('/seller-dashboard')}
            path="/seller-dashboard"
          />
          {propertyId ? (
            // Property-specific navigation
            <>
              <NavItem
                icon={<DollarSign />}
                label="Offers"
                active={activeSection === 'offers'}
                onClick={() => setActiveSection('offers')}
                path={`/seller-dashboard/property/${propertyId}/offers`}
              />
              <NavItem
                icon={<Calendar />}
                label="Viewings"
                active={activeSection === 'viewings'}
                onClick={() => setActiveSection('viewings')}
                path={`/seller-dashboard/property/${propertyId}/viewings`}
              />
              <NavItem
                icon={<Clock />}
                label="My Availability"
                active={activeSection === 'availability'}
                onClick={() => setActiveSection('availability')}
                path={`/seller-dashboard/property/${propertyId}/availability`}
              />
              {/* Property-specific "View as Buyer" option */}
              <NavItem
                icon={<ArrowUpRight />}
                label="View as Buyer"
                active={false}
                onClick={() => {
                  // Do nothing in onClick - navigation will happen through path
                }}
                path={`/property/${propertyId}?from=seller-dashboard`}
              />
              {/* <NavItem
                icon={<BarChart4 />}
                label="Analytics"
                active={activeSection === 'analytics'}
                onClick={() => setActiveSection('analytics')}
                path={`/seller-dashboard/property/${propertyId}/analytics`}
              /> */}
              {/* <NavItem
                icon={<TrendingUp />}
                label="Market Insights"
                active={activeSection === 'market-insights'}
                onClick={() => setActiveSection('market-insights')}
                path={`/seller-dashboard/property/${propertyId}/market-insights`}
              /> */}
              <NavItem
                icon={<FileText />}
                label="Documents"
                active={activeSection === 'documents'}
                onClick={() => setActiveSection('documents')}
                path={`/seller-dashboard/property/${propertyId}/documents`}
              />
              {/* <NavItem
                icon={<Bell />}
                label="Notifications"
                active={activeSection === 'notifications'}
                onClick={() => setActiveSection('notifications')}
                path={`/seller-dashboard/property/${propertyId}/notifications`}
              /> */}
            </>
          ) : (
            // General navigation when no property is selected
            <>
              <NavItem
                icon={<Plus />}
                label="Add Property"
                active={activeSection === 'add-property'}
                onClick={() => navigate('/seller-dashboard/add-property')}
                path="/seller-dashboard/add-property"
              />
              {/* General "View as Buyer" option that directs to public listings */}
              <NavItem
                icon={<ArrowUpRight />}
                label="View as Buyer"
                active={false}
                onClick={() => {
                  // Do nothing in onClick - navigation will happen through path
                }}
                path="/properties?from=seller-dashboard"
              />
            </>
          )}
        </nav>

        {/* Previous Chats */}
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
        <div className="mt-auto border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email || 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
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
        {/* Mobile Header */}
        <header className="bg-white border-b md:hidden p-4 flex items-center justify-between">
          <button
            className="text-gray-500 hover:text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-emerald-600" />
            <span className="text-lg font-bold tracking-tight">
              <span>M</span>
              <span className="text-emerald-600">ai</span>
              <span>SON</span>
            </span>
          </div>
          <div className="w-6"></div> {/* Empty div for flex spacing */}
        </header>

        {/* Property Loading State */}
        {propertyId && isLoadingProperty && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <span className="ml-2 text-gray-600">Loading property details...</span>
          </div>
        )}

        {/* Property Error State */}
        {propertyId && propertyError && (
          <div className="bg-red-50 text-red-700 p-4 m-4 rounded-lg">
            <p>{propertyError}</p>
            <button 
              onClick={handleBackToProperties}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              Return to My Properties
            </button>
          </div>
        )}

        <main className={`flex-1 overflow-y-auto ${
          activeSection === 'messages' ? 'p-0' : 'p-4 sm:p-8'
        }`}>
          <div className={`${
            activeSection === 'messages' ? 'w-full h-full' : 'max-w-[95%] mx-auto'
          }`}>
            {propertyId ? (
              // Property-specific routes
              <Routes>
                <Route path="offers" element={<OffersSection property={property || undefined} />} />
                <Route path="viewings" element={<ViewingsSection />} />
                <Route path="availability" element={<AvailabilitySection />} />
                {/* <Route path="analytics" element={<AnalyticsSection />} /> */}
                {/* <Route path="market-insights" element={<MarketInsightsSection />} /> */}
                {/* <Route path="notifications" element={<NotificationsSection />} /> */}
                <Route path="documents" element={<DocumentsSection />} />
                <Route index element={<OffersSection property={property || undefined} />} />
              </Routes>
            ) : (
              // General routes
              <Routes>
                <Route path="add-property" element={<AddPropertySection />} />
                <Route path="edit-property/:propertyId" element={<AddPropertySection />} />
              </Routes>
            )}
          </div>
        </main>
        <PersistentChat hide={isMessagesSection} isDashboard={true} />
      </div>
    </div>
  );
};

// NavItem Component
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, path }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    onClick();
    navigate(path);
  };
  
  return (
    <button
      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      onClick={handleClick}
    >
      <span className={`${active ? 'text-emerald-600' : 'text-gray-500'}`}>
        {React.cloneElement(icon, { className: 'h-5 w-5' })}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default SellerDashboard;