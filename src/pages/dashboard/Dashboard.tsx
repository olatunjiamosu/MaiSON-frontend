import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Eye, 
  MessageSquare, 
  Settings, 
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  HourglassIcon,
  CalendarCheck,
  Trash2,
  LogOut,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PropertyService from '../../services/PropertyService';
import { DashboardResponse, PropertySummary } from '../../types/property';
import { formatPrice } from '../../lib/formatters';
import PageTitle from '../../components/PageTitle';
import PersistentChat from '../../components/chat/PersistentChat';
import { useMenu } from '../../context/MenuContext';
import { toast } from 'react-hot-toast';
import ViewingService from '../../services/ViewingService';
import { Viewing } from '../../types/viewing';
import { useChat } from '../../context/ChatContext';
import { useLogout } from '../../hooks/useLogout';
import propertyQuestionsService from '../../services/PropertyQuestionsService';
import { format } from 'date-fns';
import PreviousChats from '../../components/chat/PreviousChats';
import AllQuestionsSection from './AllQuestionsSection';

// Add formatStatus helper function after imports
const formatStatus = (status: string): string => {
  switch(status) {
    case 'for_sale':
      return 'For Sale';
    case 'under_offer':
      return 'Under Offer';
    case 'sold':
      return 'Sold';
    case 'withdrawn':
      return 'Withdrawn';
    case 'active':
      return 'For Sale';
    case 'pending':
      return 'Under Offer';
    default:
      return 'For Sale';
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { isMenuOpen } = useMenu();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoadingViewings, setIsLoadingViewings] = useState(true);
  const { chatHistory, isLoadingChats } = useChat();
  const handleLogout = useLogout();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingDashboard(true);
      }
      setError(null);
      
      // Get all dashboard data in one call
      const data = await PropertyService.getUserDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoadingDashboard(false);
      setIsRefreshing(false);
    }
  };

  // Fetch viewings data
  const fetchViewings = async () => {
    try {
      setIsLoadingViewings(true);
      const data = await ViewingService.getUpcomingViewings();
      setViewings(data);
    } catch (error) {
      console.error('Error fetching viewings:', error);
    } finally {
      setIsLoadingViewings(false);
    }
  };

  // Add function to fetch questions
  const fetchQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const fetchedQuestions = await propertyQuestionsService.getSellerQuestions();
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Initial fetch of all data
  useEffect(() => {
    fetchDashboardData();
    fetchViewings();
    fetchQuestions();
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Render loading state only for initial dashboard load
  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <p>{error}</p>
            <button 
              onClick={handleRefresh} 
              className="ml-4 px-3 py-1 bg-red-50 border border-red-300 rounded text-red-700 hover:bg-red-100 flex items-center"
            >
              <RefreshCw size={16} className="mr-1" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gray-50" />
      <div className="relative">
        <PageTitle title="Dashboard" />
        
        <Routes>
          <Route path="questions" element={<AllQuestionsSection />} />
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8 max-w-7xl pb-24">
              {/* Header */}
              <div className="flex flex-col mb-8">
                <div className="flex items-center justify-between">
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
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/profile-settings')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Settings className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                    >
                      <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {dashboardData?.user?.first_name || user?.email?.split('@')[0]}
                  </h1>
                  <p className="text-gray-600">Manage your properties and property search in one place</p>
                </div>
              </div>

              {/* Activity Overview Section - Moved to top */}
              <section className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Accepted Offers */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Accepted Offers</h3>
                          <p className="text-sm text-gray-500">As buyer or seller</p>
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {(dashboardData?.negotiations_as_buyer?.filter(n => n.status === 'accepted').length || 0) + 
                         (dashboardData?.negotiations_as_seller?.filter(n => n.status === 'accepted').length || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Active Negotiations */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <HourglassIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Active Negotiations</h3>
                          <p className="text-sm text-gray-500">Pending offers & responses</p>
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {(dashboardData?.negotiations_as_buyer?.filter(n => 
                          ['pending', 'active', 'counter_offer', 'under_offer'].includes(n.status)
                        ).length || 0) +
                         (dashboardData?.negotiations_as_seller?.filter(n => 
                          ['pending', 'active', 'counter_offer', 'under_offer'].includes(n.status)
                        ).length || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Upcoming Viewings */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CalendarCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Upcoming Viewings</h3>
                          <p className="text-sm text-gray-500">Next 7 days</p>
                        </div>
                      </div>
                      {isLoadingViewings ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <p className="text-2xl font-semibold text-gray-900">
                          {viewings?.length || 0}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Main content grid - combine both grids into one */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Properties I'm Selling Section */}
                <section className={`border border-gray-100 rounded-lg p-6 bg-white shadow-sm ${
                  dashboardData?.listed_properties && dashboardData.listed_properties.length > 0 
                    ? dashboardData?.negotiations_as_buyer && dashboardData.negotiations_as_buyer.length > 0
                      ? 'lg:col-span-2'
                      : dashboardData.listed_properties.length === 1 && (!dashboardData?.negotiations_as_buyer || dashboardData.negotiations_as_buyer.length === 0)
                        ? 'lg:col-span-2'
                        : 'lg:col-span-3'
                    : 'lg:col-span-1'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Properties I'm Selling</h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 justify-center">
                    {/* Property Cards */}
                    {dashboardData?.listed_properties && dashboardData.listed_properties.map((property) => (
                      <div 
                        key={property.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-[250px]"
                        onClick={() => navigate(`/dashboard/seller/property/${property.id}`)}
                      >
                        <div className="relative h-28">
                          <img 
                            src={property.main_image_url || '/placeholder-property.jpg'} 
                            alt={property.address.street}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 bg-emerald-600 text-white px-2 py-0.5 text-sm">
                            {formatPrice(property.price)}
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                              ${(property.status ?? 'for_sale') === 'active' || (property.status ?? 'for_sale') === 'for_sale' ? 'bg-emerald-100 text-emerald-700' :
                                (property.status ?? 'for_sale') === 'pending' || (property.status ?? 'for_sale') === 'under_offer' ? 'bg-yellow-100 text-yellow-700' :
                                (property.status ?? 'for_sale') === 'sold' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'}`}
                            >
                              {formatStatus(property.status ?? 'for_sale')}
                            </span>
                          </div>
                        </div>
                        <div className="px-3 pt-2 pb-2">
                          <h3 className="font-medium text-gray-900 mb-0.5 text-sm">{property.address.street}</h3>
                          <p className="text-gray-500 text-xs mb-0.5">{property.address.city}, {property.address.postcode}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{property.specs.bedrooms} beds</span>
                            <span>•</span>
                            <span>{property.specs.bathrooms} baths</span>
                            <span>•</span>
                            <span>{property.specs.square_footage} sq ft</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Property Card */}
                    <div className="w-[250px]">
                      <div 
                        onClick={() => navigate('/dashboard/add-property')}
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 cursor-pointer h-[180px]"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                          <Plus className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Add New Property</h3>
                        <p className="text-gray-500 text-sm text-center">List a new property</p>
                      </div>
                    </div>

                    {/* Invisible placeholder card to maintain grid layout */}
                    {dashboardData?.listed_properties && dashboardData.listed_properties.length === 2 && (
                      <div className="w-[250px] invisible" />
                    )}
                  </div>
                </section>

                {/* Properties I'm Buying Section */}
                <section className={`border border-gray-100 rounded-lg p-6 bg-white shadow-sm ${
                  dashboardData?.negotiations_as_buyer && dashboardData.negotiations_as_buyer.length > 0 
                    ? dashboardData?.listed_properties && dashboardData.listed_properties.length > 0
                      ? 'lg:col-span-2'
                      : dashboardData.negotiations_as_buyer.length === 1 && (!dashboardData?.listed_properties || dashboardData.listed_properties.length === 0)
                        ? 'lg:col-span-2'
                        : 'lg:col-span-3'
                    : 'lg:col-span-1'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Properties I'm Buying</h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                    {/* Properties with Offers */}
                    {dashboardData?.negotiations_as_buyer && 
                      // Create a map of property_id to the most recent negotiation
                      Object.values(
                        dashboardData.negotiations_as_buyer.reduce((acc, negotiation) => {
                          if (!acc[negotiation.property_id] || 
                              new Date(negotiation.last_updated) > new Date(acc[negotiation.property_id].last_updated)) {
                            acc[negotiation.property_id] = negotiation;
                          }
                          return acc;
                        }, {} as Record<string, typeof dashboardData.negotiations_as_buyer[0]>)
                      ).map((negotiation) => {
                        const property = dashboardData.offered_properties.find(p => p.property_id === negotiation.property_id);
                        if (!property) return null;
                        
                        return (
                          <div 
                            key={negotiation.property_id}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-[250px]"
                            onClick={() => navigate(`/dashboard/buyer/property/${negotiation.property_id}`)}
                          >
                            <div className="relative h-28">
                              <img 
                                src={property.main_image_url || '/placeholder-property.jpg'} 
                                alt={property.address.street}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 bg-emerald-600 text-white px-2 py-0.5 text-sm">
                                {formatPrice(negotiation.current_offer)}
                              </div>
                              <div className="absolute top-2 left-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                  ${negotiation.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                    negotiation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    negotiation.status === 'counter_offer' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'}`}
                                >
                                  {negotiation.status === 'accepted' ? 'Accepted' :
                                   negotiation.status === 'rejected' ? 'Rejected' :
                                   negotiation.status === 'counter_offer' ? 'Counter Offer' :
                                   'Pending'}
                                </span>
                              </div>
                            </div>
                            <div className="px-3 pt-2 pb-2">
                              <h3 className="font-medium text-gray-900 mb-0.5 text-sm">{property.address.street}</h3>
                              <p className="text-gray-500 text-xs mb-0.5">{property.address.city}, {property.address.postcode}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{property.specs.bedrooms} beds</span>
                                <span>•</span>
                                <span>{property.specs.bathrooms} baths</span>
                                <span>•</span>
                                <span>{property.specs.square_footage} sq ft</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }

                    {/* Browse Properties Card */}
                    <div className="w-[250px]">
                      <div 
                        onClick={() => navigate('/dashboard/listings')}
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 cursor-pointer h-[180px]"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                          <Search className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Browse Properties</h3>
                        <p className="text-gray-500 text-sm text-center">Find your next home</p>
                      </div>
                    </div>

                    {/* Invisible placeholder card to maintain grid layout */}
                    {dashboardData?.negotiations_as_buyer && Object.keys(
                      dashboardData.negotiations_as_buyer.reduce((acc, negotiation) => {
                        acc[negotiation.property_id] = negotiation;
                        return acc;
                      }, {} as Record<string, typeof dashboardData.negotiations_as_buyer[0]>)
                    ).length === 2 && (
                      <div className="w-[250px] invisible" />
                    )}
                  </div>
                </section>

                {/* Upcoming Viewings Section */}
                <section className={`border border-gray-100 rounded-lg p-6 bg-white shadow-sm ${
                  (!dashboardData?.listed_properties || dashboardData.listed_properties.length === 0) && 
                  (!dashboardData?.negotiations_as_buyer || dashboardData.negotiations_as_buyer.length === 0)
                    ? 'lg:col-span-2'
                    : 'lg:col-span-2'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Upcoming Viewings</h2>
                    </div>
                  </div>
                  <div className="space-y-4 h-[180px] overflow-y-auto">
                    {isLoadingViewings ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-gray-500">Loading viewings...</p>
                        </div>
                      </div>
                    ) : viewings && viewings.length > 0 ? (
                      viewings.map((viewing) => (
                        <div key={viewing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">{viewing.property.address.street}</h3>
                            <p className="text-sm text-gray-500">{new Date(viewing.datetime).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => navigate(`/viewings/${viewing.id}`)}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 text-center">No upcoming viewings scheduled</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Recent Chats Section */}
                <section className="border border-gray-100 rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Recent Chats</h2>
                    </div>
                  </div>
                  <div className="space-y-4 h-[180px] overflow-y-auto">
                    {isLoadingChats ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-2"></div>
                          <p className="text-gray-500">Loading chats...</p>
                        </div>
                      </div>
                    ) : chatHistory && chatHistory.length > 0 ? (
                      // Sort chats by timestamp in descending order (most recent first)
                      [...chatHistory]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((chat) => (
                          <div 
                            key={chat.id} 
                            className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => navigate('/dashboard/listings/property-chats')}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {chat.type === 'property' ? (
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Home className="h-4 w-4 text-emerald-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <MessageCircle className="h-4 w-4 text-purple-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 mb-1">{chat.question}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(chat.timestamp).toLocaleString([], {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No recent conversations</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Questions Section */}
                {dashboardData?.listed_properties && dashboardData.listed_properties.length > 0 && (
                  <section className="border border-gray-100 rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <HelpCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Property Questions</h2>
                      </div>
                      <button
                        onClick={() => navigate('questions')}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-4 h-[180px] overflow-y-auto">
                      {isLoadingQuestions ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                            <p className="text-gray-500">Loading questions...</p>
                          </div>
                        </div>
                      ) : questions && questions.length > 0 ? (
                        questions
                          .slice(0, 3) // Show only the 3 most recent questions
                          .map((question) => (
                            <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <HelpCircle className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                                    {question.question_text}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      question.status === 'answered' 
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {question.status === 'answered' ? 'Answered' : 'Pending'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {format(new Date(question.created_at), 'PPP')}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate(`/dashboard/seller/property/${question.property_id}/questions`)}
                                  className="flex-shrink-0 text-emerald-600 hover:text-emerald-700"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                            <HelpCircle className="h-6 w-6 text-blue-600" />
                          </div>
                          <p className="text-gray-600 mb-1">No Questions Found</p>
                          <p className="text-sm text-gray-500">You haven't received any questions for your properties yet.</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Documents Section */}
                <section className="border border-gray-100 rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Home className="h-6 w-6 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Documents</h2>
                    </div>
                  </div>
                  <div className="h-[180px] flex items-center justify-center">
                    <p className="text-gray-500">No available documents</p>
                  </div>
                </section>

                {/* Profile Settings Section */}
                <section className="border border-gray-100 rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Settings className="h-6 w-6 text-gray-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Profile Settings</h2>
                    </div>
                  </div>
                  <div className="h-[180px]">
                    <div className="flex flex-col items-center w-full">
                      <div className="flex gap-6 mb-4">
                        <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl font-medium text-emerald-600">
                            {(dashboardData?.user?.first_name?.[0] || user?.email?.[0])?.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="whitespace-nowrap">
                            <span className="text-gray-500">Name: </span>
                            <span className="text-gray-900">{dashboardData?.user?.first_name} {dashboardData?.user?.last_name}</span>
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-gray-500">Email: </span>
                            <span className="text-gray-900">{dashboardData?.user?.email || user?.email}</span>
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-gray-500">Phone: </span>
                            <span className="text-gray-900">{dashboardData?.user?.phone_number || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/profile-settings')}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        Manage Profile Settings →
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          } />
        </Routes>

        {!isMenuOpen && <PersistentChat />}
      </div>
    </div>
  );
};

export default Dashboard; 