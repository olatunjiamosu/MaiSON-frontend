import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import PersistentChat from '../../components/chat/PersistentChat';
// Import all section components
import MyPropertiesSection from './seller-sections/ListingsManagementSection';
import AddPropertySection from './seller-sections/AddPropertySection';
import OffersSection from './seller-sections/OffersSection';
import ViewingsSection from './seller-sections/ViewingRequestsSection';
//import MessagesSection from './seller-sections/PropertyChats';
import AnalyticsSection from './seller-sections/AnalyticsSection';
import MarketInsightsSection from './seller-sections/MarketInsightsSection';
import NotificationsSection from './seller-sections/NotificationsSection';
import DocumentsSection from './seller-sections/DocumentsSection';

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
}

const SellerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('properties');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMessagesSection = location.pathname.includes('/seller-dashboard/messages');

  // Mock user data
  const userData = {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
  };

  // Mock property listings
  const mockListings = [
    {
      id: '1',
      image: '/api/placeholder/320/200',
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
      status: 'active' as const,
      dateAdded: '2023-05-15',
      viewings: 12,
      favorites: 8,
      inquiries: 3,
    },
    {
      id: '2',
      image: '/api/placeholder/320/200',
      price: '£650,000',
      road: '45 Queens Road',
      city: 'London',
      postcode: 'E8 4NN',
      beds: 3,
      baths: 1,
      reception: 1,
      sqft: 1050,
      propertyType: 'Flat',
      epcRating: 'B',
      status: 'pending' as const,
      dateAdded: '2023-04-20',
      viewings: 18,
      favorites: 15,
      inquiries: 5,
    },
  ];

  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      question: "What's the average selling time in this area?",
      timestamp: "2 days ago"
    },
    {
      id: '2',
      question: "How should I price my property?",
      timestamp: "1 day ago"
    },
    {
      id: '3',
      question: "What documents do I need for listing?",
      timestamp: "5 hours ago"
    }
  ]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);

  const handleLogoClick = () => {
    // Navigate to landing page
    navigate('/');
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'properties':
        return <PropertiesSection properties={mockListings} />;
      default:
        return (
          <div className="text-center py-16">
            <h2 className="text-xl text-gray-600">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')} section would be displayed here
            </h2>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-sm border-r transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-20`}
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
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <NavItem
            icon={<Building />}
            label="My Properties"
            active={activeSection === 'properties'}
            onClick={() => setActiveSection('properties')}
            path="/seller-dashboard"
          />
          <NavItem
            icon={<Plus />}
            label="Add Property"
            active={activeSection === 'add-property'}
            onClick={() => setActiveSection('add-property')}
            path="/seller-dashboard/add-property"
          />
          <NavItem
            icon={<DollarSign />}
            label="Offers"
            active={activeSection === 'offers'}
            onClick={() => setActiveSection('offers')}
            path="/seller-dashboard/offers"
          />
          <NavItem
            icon={<Calendar />}
            label="Viewings"
            active={activeSection === 'viewings'}
            onClick={() => setActiveSection('viewings')}
            path="/seller-dashboard/viewings"
          />
          {/* <NavItem
            icon={<MessageCircle />}
            label="Messages"
            active={activeSection === 'messages'}
            onClick={() => setActiveSection('messages')}
            path="/seller-dashboard/messages"
          /> */}
          <NavItem
            icon={<BarChart4 />}
            label="Analytics"
            active={activeSection === 'analytics'}
            onClick={() => setActiveSection('analytics')}
            path="/seller-dashboard/analytics"
          />
          <NavItem
            icon={<TrendingUp />}
            label="Market Insights"
            active={activeSection === 'market-insights'}
            onClick={() => setActiveSection('market-insights')}
            path="/seller-dashboard/market-insights"
          />
          <NavItem
            icon={<Bell />}
            label="Notifications"
            active={activeSection === 'notifications'}
            onClick={() => setActiveSection('notifications')}
            path="/seller-dashboard/notifications"
          />
          {/* <NavItem
            icon={<Settings />}
            label="Preferences"
            active={activeSection === 'preferences'}
            onClick={() => setActiveSection('preferences')}
          /> */}
          <NavItem
            icon={<FileText />}
            label="Documents"
            active={activeSection === 'documents'}
            onClick={() => setActiveSection('documents')}
            path="/seller-dashboard/documents"
          />
        </nav>

        {/* Previous Chats */}
        <div className="px-4 py-3 border-t">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Previous Chats</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {chatHistory.map((chat) => (
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
        </div>

        {/* Profile Section */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">{userData.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{userData.name}</p>
              <p className="text-xs text-gray-500">{userData.email}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

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
              <Route index element={<MyPropertiesSection />} />
              <Route path="add-property" element={<AddPropertySection />} />
              <Route path="offers" element={<OffersSection />} />
              <Route path="viewings" element={<ViewingsSection />} />
              <Route path="analytics" element={<AnalyticsSection />} />
              <Route path="market-insights" element={<MarketInsightsSection />} />
              <Route path="notifications" element={<NotificationsSection />} />
              <Route path="documents" element={<DocumentsSection />} />
            </Routes>
          </div>
        </main>
        <PersistentChat hide={isMessagesSection} isDashboard={true} />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Selected Chat Modal */}
      {selectedChat && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setSelectedChat(null)}
        >
          <div 
            className="bg-white rounded-xl w-[800px] max-h-[80vh] flex flex-col ml-32"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-end">
                <div className="bg-emerald-600 text-white rounded-lg p-3 max-w-[80%]">
                  {selectedChat.question}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold">M</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  Sorry, I encountered an error. Please try again.
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask Mia about anything..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path 
                      d="M22 2L2 9L11 13L22 2ZM22 2L15 22L11 13L22 2Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// NavItem component
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
    onClick();
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

// Properties Section component
const PropertiesSection: React.FC<{ properties: Property[] }> = ({ properties }) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 mt-1">Manage your property listings</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border rounded-lg text-gray-700">
            <Filter className="h-5 w-5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg text-white">
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

// Property Card component
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    sold: 'bg-blue-100 text-blue-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  } as const;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
      <div className="relative">
        <img
          src={property.image}
          alt={property.road}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[property.status]}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">{property.price}</h3>
          <span className="bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded-md">
            {property.propertyType}
          </span>
        </div>
        
        <p className="text-gray-700 font-medium mt-1">{property.road}</p>
        <p className="text-gray-500 text-sm">{property.city}, {property.postcode}</p>
        
        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="font-medium text-gray-700">{property.beds}</span>
            <span className="ml-1">beds</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700">{property.baths}</span>
            <span className="ml-1">baths</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700">{property.reception}</span>
            <span className="ml-1">recp</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700">{property.sqft}</span>
            <span className="ml-1">sq ft</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-gray-500">Viewings</p>
            <p className="font-semibold text-gray-900 mt-1">{property.viewings}</p>
          </div>
          <div>
            <p className="text-gray-500">Favorites</p>
            <p className="font-semibold text-gray-900 mt-1">{property.favorites}</p>
          </div>
          <div>
            <p className="text-gray-500">Inquiries</p>
            <p className="font-semibold text-gray-900 mt-1">{property.inquiries}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">
            Edit details
          </button>
          <button className="text-sm font-medium text-gray-700 flex items-center hover:text-gray-900">
            View listing <ArrowUpRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;