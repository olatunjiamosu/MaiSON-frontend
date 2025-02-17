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
} from 'lucide-react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';

// Import Sections (from `buyer-sections`)
import ListingsSection from './buyer-sections/ListingsSection';
import MatchesSection from './buyer-sections/MatchesSection';
import SavedPropertiesSection from './buyer-sections/SavedPropertiesSection';
import ViewingsSection from './buyer-sections/ViewingsSection';
import ApplicationsSection from './buyer-sections/ApplicationsSection';
import PropertyChats from './buyer-sections/PropertyChats';
import NotificationsSection from './buyer-sections/NotificationsSection';
import PreferencesSection from './buyer-sections/PreferencesSection';
import DocumentsSection from './buyer-sections/DocumentsSection';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Simulating user data (Replace with real auth system)
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          inset-y-0 left-0
          w-64 
          bg-white shadow-sm border-r 
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          z-20
        `}
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

        {/* Navigation Links (Updated Order) */}
        <nav className="p-4 space-y-1">
          <NavItem
            icon={<List />}
            label="All Listings"
            active={activeSection === 'listings'}
            onClick={() => setActiveSection('listings')}
            path="/buyer-dashboard"
          />
          <NavItem
            icon={<Handshake />}
            label="Property Matches"
            active={activeSection === 'matches'}
            onClick={() => setActiveSection('matches')}
            path="/buyer-dashboard/matches"
          />
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
          <NavItem
            icon={<Settings />}
            label="Preferences"
            active={activeSection === 'preferences'}
            onClick={() => setActiveSection('preferences')}
            path="/buyer-dashboard/preferences"
          />
          <NavItem
            icon={<FileText />}
            label="Documents"
            active={activeSection === 'documents'}
            onClick={() => setActiveSection('documents')}
            path="/buyer-dashboard/documents"
          />
        </nav>

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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route
                index
                element={<ListingsSection properties={mockProperties} />}
              />
              <Route path="saved" element={<SavedPropertiesSection />} />
              <Route path="viewings" element={<ViewingsSection />} />
              <Route path="messages" element={<PropertyChats />} />
              <Route path="applications" element={<ApplicationsSection />} />
              <Route path="documents" element={<DocumentsSection />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        />
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
