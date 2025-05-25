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
  SwitchCamera,
  RefreshCw,
  History
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
import MyPropertySection from './seller-sections/MyPropertySection';
import TimelineSection from '../../components/timeline/TimelineSection';
//import MessagesSection from './seller-sections/PropertyChats';
//import AnalyticsSection from './seller-sections/AnalyticsSection';
//import MarketInsightsSection from './seller-sections/MarketInsightsSection';
//import NotificationsSection from './seller-sections/NotificationsSection';
import DocumentsSection from './seller-sections/DocumentsSection';
import AvailabilitySection from './seller-sections/AvailabilitySection';
import PropertyQuestionsSection from './seller-sections/PropertyQuestionsSection';
import { PropertyDetail } from '../../types/property';
import { toast } from 'react-hot-toast';
import { MdHome, MdDescription, MdOutlineAttachMoney } from 'react-icons/md';
import { BsChatLeftText } from 'react-icons/bs';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { formatLargeNumber } from '../../utils/numberUtils';
import PreviousChats from '../../components/chat/PreviousChats';
import PageTitle from '../../components/PageTitle';
import PropertyChatSection from './buyer-sections/PropertyChatSection';

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
  const [isLoadingViewings, setIsLoadingViewings] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Compute if we're in the messages section to hide the persistent chat
  const isMessagesSection = activeSection === 'messages' || 
                           location.pathname.includes('/seller-dashboard/messages') ||
                           location.pathname.includes('/chat');

  // Get chat history from context
  const { chatHistory, isLoadingChats, addConversation, refreshChatHistory } = useChat();

  // Fetch property details when propertyId changes
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) return;
      
      setIsLoadingProperty(true);
      setPropertyError(null);
      
      try {
        const propertyData = await PropertyService.getPropertyById(propertyId);
        setProperty({
          ...propertyData,
          status: 'active',
          id: propertyData.id || propertyData.property_id || propertyId
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

  // Load viewings and chat data after initial render
  useEffect(() => {
    const loadSecondaryData = async () => {
      if (!propertyId) return;

      // Load viewings data
      setIsLoadingViewings(true);
      try {
        // Add your viewings API call here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      } catch (error) {
        console.error('Error loading viewings:', error);
      } finally {
        setIsLoadingViewings(false);
      }

      // Load chat data
      setIsLoadingChat(true);
      try {
        await refreshChatHistory();
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadSecondaryData();
  }, [propertyId, refreshChatHistory]);

  // Update active section based on location - only as a backup for direct navigation
  useEffect(() => {
    // Only use this effect for syncing with direct URL navigation
    // Extract section from path: /seller-dashboard/property/123/section
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Only change if it's a known section
    if (['offers', 'viewings', 'messages', 'documents', 'availability', 'view-as-buyer', 'timeline', 'chat'].includes(lastPart)) {
      setActiveSection(lastPart);
    } else if (location.pathname === '/seller-dashboard') {
      setActiveSection('properties');
    } else if (propertyId) {
      // When we're at the property root path (e.g., /dashboard/seller/property/123)
      // or any property-specific path without a section
      setActiveSection('my-property');
    }
  }, [location.pathname, propertyId]);

  // Mock user data
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
    navigate('/dashboard');
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

  // Update title based on current section and property context
  useEffect(() => {
    if (propertyId && property) {
      // Property-specific pages
      const section = location.pathname.split('/').pop() || 'offers'; // Default to offers if no section
      const sectionTitles: { [key: string]: string } = {
        'offers': `Offers | ${property.address.street} | Seller Dashboard | MaiSON`,
        'viewings': `Viewing Requests | ${property.address.street} | Seller Dashboard | MaiSON`,
        'messages': `Property Chats | ${property.address.street} | Seller Dashboard | MaiSON`,
        'documents': `Documents | ${property.address.street} | Seller Dashboard | MaiSON`,
        'availability': `Availability | ${property.address.street} | Seller Dashboard | MaiSON`,
        'view-as-buyer': `Buyer View | ${property.address.street} | Seller Dashboard | MaiSON`
      };
      document.title = sectionTitles[section] || sectionTitles['offers'];
    } else {
      // General dashboard pages
      const sectionTitles: { [key: string]: string } = {
        'properties': 'My Properties | Seller Dashboard | MaiSON',
        'add-property': 'Add Property | Seller Dashboard | MaiSON',
        'analytics': 'Analytics | Seller Dashboard | MaiSON',
        'market-insights': 'Market Insights | Seller Dashboard | MaiSON',
        'notifications': 'Notifications | Seller Dashboard | MaiSON'
      };
      document.title = sectionTitles[activeSection] || sectionTitles['properties'];
    }
  }, [propertyId, property, activeSection, location.pathname]);

  // Function to handle section changes - explicitly set state and navigate
  const handleSectionChange = (section: string, path: string) => {
    setActiveSection(section);
    navigate(path);
  };

  return (
    <React.Fragment>
      {/* Dynamic PageTitle based on location and property */}
      {propertyId && property ? (
        // Property-specific titles
        <>
          {location.pathname.includes('/offers') && (
            <PageTitle title={`Offers | ${property.address.street} | Seller Dashboard`} />
          )}
          {location.pathname.includes('/viewings') && (
            <PageTitle title={`Viewing Requests | ${property.address.street} | Seller Dashboard`} />
          )}
          {location.pathname.includes('/messages') && (
            <PageTitle title={`Property Chats | ${property.address.street} | Seller Dashboard`} />
          )}
          {location.pathname.includes('/documents') && (
            <PageTitle title={`Documents | ${property.address.street} | Seller Dashboard`} />
          )}
          {location.pathname.includes('/availability') && (
            <PageTitle title={`Availability | ${property.address.street} | Seller Dashboard`} />
          )}
          {location.pathname.includes('/view-as-buyer') && (
            <PageTitle title={`Buyer View | ${property.address.street} | Seller Dashboard`} />
          )}
          {/* Default to My Property when first loading a property */}
          {!location.pathname.includes('/') && (
            <PageTitle title={`My Property | ${property.address.street} | Seller Dashboard`} />
          )}
        </>
      ) : (
        // General dashboard titles
        <>
          {activeSection === 'properties' && <PageTitle title="My Properties | Seller Dashboard" />}
          {activeSection === 'add-property' && <PageTitle title="Add Property | Seller Dashboard" />}
          {activeSection === 'analytics' && <PageTitle title="Analytics | Seller Dashboard" />}
          {activeSection === 'market-insights' && <PageTitle title="Market Insights | Seller Dashboard" />}
          {activeSection === 'notifications' && <PageTitle title="Notifications | Seller Dashboard" />}
        </>
      )}

    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-sm border-r transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-30 flex flex-col h-screen`}
      >
        {/* Top fixed section */}
        <div className="flex-shrink-0">
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

          {/* Back to Dashboard Button */}
          {propertyId && property && (
            <div className="p-4 border-b">
              <button 
                onClick={handleBackToProperties}
                className="flex items-center text-emerald-600 hover:text-emerald-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                <span className="text-[0.9375rem] font-medium">Back to Dashboard</span>
              </button>
            </div>
          )}

          {/* Property Info (if property is loaded) */}
          {propertyId && property && (
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSectionChange('my-property', `/dashboard/seller/property/${propertyId}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src={property.main_image_url || '/placeholder-property.jpg'} 
                    alt={property.address.street}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
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
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links - Not scrollable */}
        <nav className="p-4 space-y-1 flex-shrink-0">
          {/* <NavItem
            icon={<Building />}
            label="My Properties"
            active={activeSection === 'properties'}
            onClick={() => handleSectionChange('properties', '/seller-dashboard')}
            path="/seller-dashboard"
          /> */}
          {propertyId ? (
            // Property-specific navigation
            <>
              <NavItem
                icon={<Home />}
                label="My Property"
                active={activeSection === 'my-property' || !activeSection}
                onClick={() => handleSectionChange('my-property', `/dashboard/seller/property/${propertyId}`)}
                path={`/dashboard/seller/property/${propertyId}`}
              />
              <NavItem
                icon={<History />}
                label="Timeline"
                active={activeSection === 'timeline'}
                onClick={() => handleSectionChange('timeline', `/dashboard/seller/property/${propertyId}/timeline`)}
                path={`/dashboard/seller/property/${propertyId}/timeline`}
              />
              <NavItem
                icon={<DollarSign />}
                label="Offers"
                active={activeSection === 'offers'}
                onClick={() => handleSectionChange('offers', `/dashboard/seller/property/${propertyId}/offers`)}
                path={`/dashboard/seller/property/${propertyId}/offers`}
              />
              <NavItem
                icon={<Calendar />}
                label="Viewings"
                active={activeSection === 'viewings'}
                onClick={() => handleSectionChange('viewings', `/dashboard/seller/property/${propertyId}/viewings`)}
                path={`/dashboard/seller/property/${propertyId}/viewings`}
              />
              <NavItem
                icon={<Clock />}
                label="My Availability"
                active={activeSection === 'availability'}
                onClick={() => handleSectionChange('availability', `/dashboard/seller/property/${propertyId}/availability`)}
                path={`/dashboard/seller/property/${propertyId}/availability`}
              />
              <NavItem
                icon={<MessageCircle />}
                label="Property Chat"
                active={activeSection === 'chat'}
                onClick={() => handleSectionChange('chat', `/dashboard/seller/property/${propertyId}/chat`)}
                path={`/dashboard/seller/property/${propertyId}/chat`}
              />
              <NavItem
                icon={<FileText />}
                label="Documents"
                active={activeSection === 'documents'}
                onClick={() => handleSectionChange('documents', `/dashboard/seller/property/${propertyId}/documents`)}
                path={`/dashboard/seller/property/${propertyId}/documents`}
              />
              <NavItem
                icon={<MessageCircle />}
                label="Questions"
                active={activeSection === 'questions'}
                onClick={() => handleSectionChange('questions', `/dashboard/seller/property/${propertyId}/questions`)}
                path={`/dashboard/seller/property/${propertyId}/questions`}
              />
              <NavItem
                icon={<ArrowUpRight />}
                label="View as Buyer"
                active={activeSection === 'view-as-buyer'}
                onClick={() => navigate(`/property/${propertyId}?from=seller-dashboard`)}
                path={`/property/${propertyId}?from=seller-dashboard`}
              />
            </>
          ) : (
            // General navigation when no property is selected
            <>
              <NavItem
                icon={<Plus />}
                label="Add Property"
                active={activeSection === 'add-property'}
                onClick={() => handleSectionChange('add-property', '/seller-dashboard/add-property')}
                path="/seller-dashboard/add-property"
              />
              {/* General "View as Buyer" option that directs to public listings */}
              <NavItem
                icon={<ArrowUpRight />}
                label="View as Buyer"
                active={false}
                onClick={() => navigate('/properties?from=seller-dashboard')}
                path="/properties?from=seller-dashboard"
              />
            </>
          )}
        </nav>
      </aside>

      {/* Add overlay for closing sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden relative`}>
        {/* Mobile Header - only for menu toggle */}
        <header className="bg-transparent md:hidden p-4 flex items-center">
          <button
            className="text-gray-500 hover:text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
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
          activeSection === 'messages' ? 'p-0' : 'p-8'
        }`}>
          <div className={`${
            activeSection === 'messages' ? 'w-full h-full' : 'max-w-7xl mx-auto'
          }`}>
              <Routes>
                <Route path="offers" element={<OffersSection property={property || undefined} />} />
                <Route path="viewings" element={
                  isLoadingViewings ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <ViewingsSection />
                  )
                } />
                <Route path="availability" element={<AvailabilitySection />} />
                <Route path="documents" element={<DocumentsSection />} />
                <Route path="questions" element={<PropertyQuestionsSection />} />
                <Route path="my-property" element={!isLoadingProperty ? <MyPropertySection property={property || undefined} /> : null} />
                <Route path="timeline" element={<TimelineSection viewMode="seller" />} />
                <Route path="chat" element={
                  isLoadingChat ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  ) : property ? (
                    <PropertyChatSection propertyId={propertyId} role="seller" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-emerald-500 mb-4" />
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property Chat</h2>
                      <p className="text-gray-600">Loading property details...</p>
                    </div>
                  )
                } />
                <Route index element={!isLoadingProperty ? <MyPropertySection property={property || undefined} /> : null} />
              </Routes>
          </div>
          {/* Add padding at the bottom to ensure content isn't hidden behind the chat input */}
          {!isMessagesSection && <div className="pb-28 md:pb-24"></div>}
        </main>
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <PersistentChat hide={isMessagesSection} isDashboard={true} />
        </div>
      </div>

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

            {/* Input area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Type your message..."
                  value={modalInputMessage}
                  onChange={(e) => setModalInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendModalMessage();
                    }
                  }}
                />
                <button
                  className={`px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ${
                    isSendingMessage ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  onClick={handleSendModalMessage}
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

// NavItem Component
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, path }) => {
  return (
    <button
      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      onClick={onClick}
    >
      <span className={`${active ? 'text-emerald-600' : 'text-gray-500'}`}>
        {React.cloneElement(icon, { className: 'h-5 w-5' })}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default SellerDashboard;