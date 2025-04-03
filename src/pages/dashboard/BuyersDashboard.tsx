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
import PropertyDetailsSection from './buyer-sections/PropertyDetailsSection';
import AvailabilitySection from './seller-sections/AvailabilitySection';
import { PropertyDetail } from '../../types/property';
import { ChatHistory } from '../../types/chat';
import { toast } from 'react-hot-toast';
import { formatLargeNumber } from '../../utils/numberUtils';
import PreviousChats from '../../components/chat/PreviousChats';
import PageTitle from '../../components/PageTitle';

// Add interfaces for the components
interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  onClick: () => void;
  path: string;
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

const BuyersDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('properties');
  const [cameFromListings, setCameFromListings] = useState(false);
  const [cameFromSaved, setCameFromSaved] = useState(false);
  const auth = useAuth();
  const { user, userRole } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<PropertyDetailWithStatus | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  
  // Compute if we're in the messages section to hide the persistent chat
  const isMessagesSection = activeSection === 'messages' || 
                           location.pathname.includes('/seller-dashboard/messages');

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
        // Add a default status of 'active' to the property
        setProperty({
          ...propertyData,
          status: 'active' // Default status
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

  // Update active section based on location - only as a backup for direct navigation
  useEffect(() => {
    // Only use this effect for syncing with direct URL navigation
    // Extract section from path: /seller-dashboard/property/123/section
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Only change if it's a known section
    if (['offers', 'viewings', 'messages', 'documents', 'availability', 'view-as-buyer'].includes(lastPart)) {
      setActiveSection(lastPart);
    } else if (location.pathname === '/seller-dashboard') {
      setActiveSection('properties');
    } else if (propertyId) {
      // When we're at the property root path (e.g., /dashboard/seller/property/123)
      // or any property-specific path without a section
      setActiveSection('my-property');
    }
  }, [location.pathname, propertyId]);

  // Add effect to check where user came from
  useEffect(() => {
    const from = location.state?.from;
    if (from === 'listings') {
      setCameFromListings(true);
      setCameFromSaved(false);
    } else if (from === 'saved') {
      setCameFromListings(false);
      setCameFromSaved(true);
    } else {
      setCameFromListings(false);
      setCameFromSaved(false);
    }
  }, [location.state]);

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

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleBackToProperties = () => {
    if (cameFromListings) {
      navigate('/dashboard/listings');
    } else if (cameFromSaved) {
      navigate('/dashboard/listings/saved');
    } else {
      navigate('/dashboard');
    }
  };

  // Add function to handle dashboard switch
  const handleSwitchDashboard = () => {
    navigate('/select-dashboard');
    toast.success('Switching dashboards');
  };

  // Update title based on current section and property context
  useEffect(() => {
    if (propertyId && property) {
      // Property-specific pages
      const section = location.pathname.split('/').pop() || 'offers'; // Default to offers if no section
      const sectionTitles: { [key: string]: string } = {
        'offers': `Offers | ${property.address.street} | Buyer Dashboard | MaiSON`,
        'viewings': `Viewing Requests | ${property.address.street} | Buyer Dashboard | MaiSON`,
        'messages': `Property Chats | ${property.address.street} | Buyer Dashboard | MaiSON`,
        'documents': `Documents | ${property.address.street} | Buyer Dashboard | MaiSON`,
        'availability': `Availability | ${property.address.street} | Buyer Dashboard | MaiSON`,
        'view-as-buyer': `Buyer View | ${property.address.street} | Buyer Dashboard | MaiSON`
      };
      document.title = sectionTitles[section] || sectionTitles['offers'];
    } else {
      // General dashboard pages
      const sectionTitles: { [key: string]: string } = {
        'properties': 'My Properties | Buyer Dashboard | MaiSON',
        'add-property': 'Add Property | Buyer Dashboard | MaiSON',
        'analytics': 'Analytics | Buyer Dashboard | MaiSON',
        'market-insights': 'Market Insights | Buyer Dashboard | MaiSON',
        'notifications': 'Notifications | Buyer Dashboard | MaiSON'
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
            <PageTitle title={`Offers | ${property.address.street} | Buyer Dashboard`} />
          )}
          {location.pathname.includes('/viewings') && (
            <PageTitle title={`Viewing Requests | ${property.address.street} | Buyer Dashboard`} />
          )}
          {location.pathname.includes('/messages') && (
            <PageTitle title={`Property Chats | ${property.address.street} | Buyer Dashboard`} />
          )}
          {location.pathname.includes('/documents') && (
            <PageTitle title={`Documents | ${property.address.street} | Buyer Dashboard`} />
          )}
          {location.pathname.includes('/availability') && (
            <PageTitle title={`Availability | ${property.address.street} | Buyer Dashboard`} />
          )}
          {location.pathname.includes('/view-as-buyer') && (
            <PageTitle title={`Buyer View | ${property.address.street} | Buyer Dashboard`} />
          )}
          {/* Default to Property Details when first loading a property */}
          {!location.pathname.includes('/') && (
            <PageTitle title={`Property Details | ${property.address.street} | Buyer Dashboard`} />
          )}
        </>
      ) : (
        // General dashboard titles
        <>
          {activeSection === 'properties' && <PageTitle title="My Properties | Buyer Dashboard" />}
          {activeSection === 'add-property' && <PageTitle title="Add Property | Buyer Dashboard" />}
          {activeSection === 'analytics' && <PageTitle title="Analytics | Buyer Dashboard" />}
          {activeSection === 'market-insights' && <PageTitle title="Market Insights | Buyer Dashboard" />}
          {activeSection === 'notifications' && <PageTitle title="Notifications | Buyer Dashboard" />}
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
                  <span className="text-[0.9375rem] font-medium">
                    {cameFromListings ? 'Back to All Listings' : 
                     cameFromSaved ? 'Back to Saved Properties' : 
                     'Back to Dashboard'}
                  </span>
                </button>
              </div>
            )}

            {/* Property Info */}
            {propertyId && property && (
              <div 
                className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSectionChange('my-property', `/dashboard/buyer/property/${propertyId}`)}
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
                        £{property.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links - Not scrollable */}
          <nav className="p-4 space-y-1 flex-shrink-0">
            {propertyId ? (
              // Property-specific navigation
              <>
                <NavItem
                  icon={<Home />}
                  label="Property Details"
                  active={activeSection === 'my-property' || !activeSection}
                  onClick={() => handleSectionChange('my-property', `/dashboard/buyer/property/${propertyId}`)}
                  path={`/dashboard/buyer/property/${propertyId}`}
                />
                <NavItem
                  icon={<History />}
                  label="Timeline"
                  active={activeSection === 'timeline'}
                  onClick={() => handleSectionChange('timeline', `/dashboard/buyer/property/${propertyId}/timeline`)}
                  path={`/dashboard/buyer/property/${propertyId}/timeline`}
                />
                <NavItem
                  icon={<DollarSign />}
                  label="Offers"
                  active={activeSection === 'offers'}
                  onClick={() => handleSectionChange('offers', `/dashboard/buyer/property/${propertyId}/offers`)}
                  path={`/dashboard/buyer/property/${propertyId}/offers`}
                />
                <NavItem
                  icon={<Calendar />}
                  label="Viewings"
                  active={activeSection === 'viewings'}
                  onClick={() => handleSectionChange('viewings', `/dashboard/buyer/property/${propertyId}/viewings`)}
                  path={`/dashboard/buyer/property/${propertyId}/viewings`}
                />
                <NavItem
                  icon={<MessageCircle />}
                  label="Property Chat"
                  active={activeSection === 'chat'}
                  onClick={() => handleSectionChange('chat', `/dashboard/buyer/property/${propertyId}/chat`)}
                  path={`/dashboard/buyer/property/${propertyId}/chat`}
                />
                <NavItem
                  icon={<FileText />}
                  label="Documents"
                  active={activeSection === 'documents'}
                  onClick={() => handleSectionChange('documents', `/dashboard/buyer/property/${propertyId}/documents`)}
                  path={`/dashboard/buyer/property/${propertyId}/documents`}
                />
              </>
            ) : (
              // General navigation when no property is selected
              <>
                <NavItem
                  icon={<Plus />}
                  label="Add Property"
                  active={activeSection === 'add-property'}
                  onClick={() => handleSectionChange('add-property', '/buyer-dashboard/add-property')}
                  path="/buyer-dashboard/add-property"
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
                <Route path="viewings" element={<ViewingsSection />} />
                <Route path="availability" element={<AvailabilitySection />} />
                <Route path="documents" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Documents Section</h3>
                      <p className="text-gray-500 mt-2">This section is coming soon.</p>
                    </div>
                  </div>
                } />
                <Route path="timeline" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Timeline Section</h3>
                      <p className="text-gray-500 mt-2">This section is coming soon.</p>
                    </div>
                  </div>
                } />
                <Route path="chat" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Property Chat</h3>
                      <p className="text-gray-500 mt-2">This section is coming soon.</p>
                    </div>
                  </div>
                } />
                <Route path="my-property" element={property ? <PropertyDetailsSection property={property} /> : null} />
                <Route path="*" element={
                  propertyId && property ? (
                    <PropertyDetailsSection property={property} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Welcome to Your Dashboard</h3>
                        <p className="text-gray-500 mt-2">Select a property to view its details</p>
                      </div>
                    </div>
                  )
                } />
              </Routes>
            </div>
            {/* Add padding at the bottom to ensure content isn't hidden behind the chat input */}
            {!isMessagesSection && <div className="pb-28 md:pb-24"></div>}
          </main>
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <PersistentChat hide={isMessagesSection} isDashboard={true} />
          </div>
        </div>
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

export default BuyersDashboard;
