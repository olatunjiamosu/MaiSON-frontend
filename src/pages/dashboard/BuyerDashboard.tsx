import React, { useState } from 'react';
import { 
  Home, FileText, Settings, Calendar, Bell, Search, 
  Heart, ClipboardList, MessageCircle, LogOut, Menu, List, Handshake
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Sections (from `buyer-sections`)
import ListingsSection from './buyer-sections/ListingsSection';
import MatchesSection from './buyer-sections/MatchesSection';
import SearchSection from './buyer-sections/SearchSection';
import SavedPropertiesSection from './buyer-sections/SavedPropertiesSection';
import ViewingsSection from './buyer-sections/ViewingsSection';
import ApplicationsSection from './buyer-sections/ApplicationsSection';
import MessagesSection from './buyer-sections/MessagesSection';
import NotificationsSection from './buyer-sections/NotificationsSection';
import PreferencesSection from './buyer-sections/PreferencesSection';
import DocumentsSection from './buyer-sections/DocumentsSection';

const BuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('listings');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Simulating user data (Replace with real auth system)
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
  };

  // Logout Function ✅
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-sm border-r transition-all ${sidebarOpen ? "block" : "hidden"} md:block`}>
        {/* Logo & Menu Toggle */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">
              <span>M</span><span className="text-emerald-600">ai</span><span>SON</span>
            </span>
          </div>
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links (Updated Order) */}
        <nav className="p-4 space-y-1">
          <NavItem icon={<List />} label="All Listings" active={activeSection === 'listings'} onClick={() => setActiveSection('listings')} />
          <NavItem icon={<Handshake />} label="Property Matches" active={activeSection === 'matches'} onClick={() => setActiveSection('matches')} />
          <NavItem icon={<Search />} label="Property Search" active={activeSection === 'search'} onClick={() => setActiveSection('search')} />
          <NavItem icon={<Heart />} label="Saved Properties" active={activeSection === 'saved'} onClick={() => setActiveSection('saved')} />
          <NavItem icon={<Calendar />} label="Viewings" active={activeSection === 'viewings'} onClick={() => setActiveSection('viewings')} />
          <NavItem icon={<ClipboardList />} label="Applications" active={activeSection === 'applications'} onClick={() => setActiveSection('applications')} />
          <NavItem icon={<MessageCircle />} label="Messages" active={activeSection === 'messages'} onClick={() => setActiveSection('messages')} />
          <NavItem icon={<Bell />} label="Notifications" active={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
          <NavItem icon={<Settings />} label="Preferences" active={activeSection === 'preferences'} onClick={() => setActiveSection('preferences')} />
          <NavItem icon={<FileText />} label="Documents" active={activeSection === 'documents'} onClick={() => setActiveSection('documents')} />
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
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {activeSection === 'listings' && <ListingsSection />}
          {activeSection === 'matches' && <MatchesSection />}
          {activeSection === 'search' && <SearchSection />}
          {activeSection === 'saved' && <SavedPropertiesSection />}
          {activeSection === 'viewings' && <ViewingsSection />}
          {activeSection === 'applications' && <ApplicationsSection />}
          {activeSection === 'messages' && <MessagesSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'preferences' && <PreferencesSection />}
          {activeSection === 'documents' && <DocumentsSection />}
        </div>
      </main>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        active ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {React.cloneElement(icon, { className: `h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-500'}` })}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default BuyerDashboard;
