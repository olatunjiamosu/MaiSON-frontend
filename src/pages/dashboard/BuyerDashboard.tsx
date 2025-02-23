import React, { useState, useEffect } from 'react';
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

// Import Sections (from `buyer-sections`)
import ListingsSection from './buyer-sections/ListingsSection';
//import MatchesSection from './buyer-sections/MatchesSection';
import SavedPropertiesSection from './buyer-sections/SavedPropertiesSection';
import ViewingsSection from './buyer-sections/ViewingsSection';
import ApplicationsSection from './buyer-sections/ApplicationsSection';
import PropertyChats from './buyer-sections/PropertyChats';
import NotificationsSection from './buyer-sections/NotificationsSection';
//import PreferencesSection from './buyer-sections/PreferencesSection';
import DocumentsSection from './buyer-sections/DocumentsSection';

// Add this interface near the top
interface ChatHistory {
  id: string;
  question: string;
  timestamp: string;
  isActive?: boolean;
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

  // Simulating user data (Replace with real auth system)
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  // Add this state
  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      question: "What areas in London have the best schools?",
      timestamp: "2 days ago"
    },
    {
      id: '2',
      question: "What documents do I need for a mortgage application?",
      timestamp: "1 day ago"
    },
    {
      id: '3',
      question: "Average house prices in Greenwich?",
      timestamp: "5 hours ago"
    }
  ]);

  // Add state for selected chat
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-sm border-r transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-30`}
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
            label="Applications"
            active={activeSection === 'applications'}
            onClick={() => setActiveSection('applications')}
            path="/buyer-dashboard/applications"
          />
          <NavItem
            icon={<Bell />}
            label="Notifications"
            active={activeSection === 'notifications'}
            onClick={() => setActiveSection('notifications')}
            path="/buyer-dashboard/notifications"
          />
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
        <div className="absolute bottom-0 w-64 border-t p-4">
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
                element={<ListingsSection properties={mockProperties} />}
              />
              <Route path="saved" element={<SavedPropertiesSection />} />
              <Route path="viewings" element={<ViewingsSection />} />
              <Route path="messages" element={<PropertyChats />} />
              <Route path="applications" element={<ApplicationsSection />} />
              <Route path="notifications" element={<NotificationsSection />} />
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
