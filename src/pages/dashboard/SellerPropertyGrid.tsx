import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpRight,
  Loader,
  RefreshCw,
  Home,
  SwitchCamera,
  LogOut
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import PropertyService from '../../services/PropertyService';
import { PropertySummary, PropertyFilters, SavedProperty, DashboardResponse } from '../../types/property';
import { toast } from 'react-hot-toast';
import PersistentChat from '../../components/chat/PersistentChat';
// @ts-ignore
import debounce from 'lodash.debounce';
import AddPropertySection from './seller-sections/AddPropertySection';
import { useAuth } from '../../context/AuthContext';

// Define property status type
type PropertyStatus = 'for_sale' | 'under_offer' | 'sold' | 'withdrawn';

// Extended PropertySummary with status
interface PropertyWithStatus extends PropertySummary {
  status: PropertyStatus;
  viewings?: number;
  inquiries?: number;
  favorites?: number;
}

const SellerPropertyGrid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  const auth = useAuth();
  const { userRole } = auth;

  // Set up debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial fetch of properties when component mounts
  useEffect(() => {
    // Fetch properties immediately when component mounts
    getUserProperties();
  }, []);

  // Get user ID on component mount
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setUserId(user.uid);
    } else {
      setError('You must be logged in to view your properties');
    }
  }, []);

  // Fetch user properties
  const fetchUserProperties = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Use the new dashboard API 
      const data = await PropertyService.getUserDashboard();
      setDashboardData(data);
      
      // Set the listed properties from the dashboard data with default stats if needed
      const propertiesWithStats = (data.listed_properties || []).map(property => ({
        ...property,
        viewings: property.viewings || Math.floor(Math.random() * 50),
        inquiries: property.inquiries || Math.floor(Math.random() * 20),
        favorites: property.favorites || Math.floor(Math.random() * 100)
      }));
      
      setProperties(propertiesWithStats);
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error refreshing properties:', error);
      setIsRefreshing(false);
    }
  }, []);

  // Handle property deletion
  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await PropertyService.deleteProperty(id);
        setProperties(prev => prev.filter(property => property.id !== id));
        toast.success('Property deleted successfully');
        await fetchUserProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchUserProperties();
  };

  // Format price to GBP
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle property click to navigate to property-specific dashboard
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/seller-dashboard/property/${propertyId}`);
  };

  // Toggle add property form
  const toggleAddPropertyForm = () => {
    setShowAddPropertyForm(!showAddPropertyForm);
  };

  // Function to fetch user properties
  const getUserProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the new dashboard API instead of just properties
      const data = await PropertyService.getUserDashboard();
      setDashboardData(data);
      
      // Set the listed properties from the dashboard data
      setProperties(data.listed_properties || []);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
      setIsLoading(false);
    }
  };

  // Get property stats from dashboard data
  const getPropertyStats = useMemo(() => {
    if (!dashboardData) return {
      totalProperties: 0,
      activeProperties: 0,
      pendingProperties: 0,
      soldProperties: 0
    };
    
    const totalProperties = dashboardData.total_properties_listed || 0;
    const activeProperties = dashboardData.listed_properties?.filter(p => p.status === 'for_sale').length || 0;
    const pendingProperties = dashboardData.listed_properties?.filter(p => p.status === 'under_offer').length || 0;
    const soldProperties = dashboardData.listed_properties?.filter(p => p.status === 'sold').length || 0;
    
    return {
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties
    };
  }, [dashboardData]);

  // Calculate property stats for the summary cards
  const stats = useMemo(() => {
    // Use getPropertyStats if dashboardData is available
    if (dashboardData) {
      return getPropertyStats;
    }
    
    // Legacy calculation based on properties array
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => 
      (p.status ?? 'for_sale') === 'active' || (p.status ?? 'for_sale') === 'for_sale'
    ).length;
    const pendingProperties = properties.filter(p => 
      (p.status ?? 'for_sale') === 'pending' || (p.status ?? 'for_sale') === 'under_offer'
    ).length;
    const soldProperties = properties.filter(p => 
      (p.status ?? 'for_sale') === 'sold'
    ).length;
    
    return {
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties
    };
  }, [dashboardData, getPropertyStats, properties]);

  // Add a helper function to format status for display
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

  // Add function to handle dashboard switch
  const handleSwitchDashboard = () => {
    navigate('/select-dashboard');
    toast.success('Switching dashboards');
  };

  // Handle logout
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
    <div className="flex flex-col h-screen">
      {/* Header with Dashboard Title */}
      <header className="bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-center">
        <div></div>

        <div className="flex items-center space-x-3">
          {userRole === 'both' && (
            <button
              onClick={handleSwitchDashboard}
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <SwitchCamera className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Switch Dashboard</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {showAddPropertyForm ? (
        <div className="p-6 pb-24">
          <h2 className="text-2xl font-semibold mb-6">Add New Property</h2>
          <AddPropertySection />
        </div>
      ) : (
        <div className="max-w-[95%] mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 text-emerald-600 hover:text-emerald-800 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | PropertyStatus)}
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              >
                <option value="all">All Properties</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            )}

            {/* Property Cards Grid - ALWAYS shown */}
            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {/* Add Property Card - Always shown */}
                <div 
                  onClick={toggleAddPropertyForm}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 h-80 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Property</h3>
                  <p className="text-gray-500 text-center">List a new property for sale</p>
                </div>

                {/* Property Cards - Only shown if there are properties */}
                {properties.length > 0 && properties.map((property) => (
                  <div 
                    key={property.id} 
                    className="bg-white rounded-lg border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePropertyClick(property.id)}
                  >
                    <div className="relative">
                      <img
                        src={property.main_image_url || '/placeholder-property.jpg'}
                        alt={property.address.street}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-property.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                          ${(property.status ?? 'for_sale') === 'active' || (property.status ?? 'for_sale') === 'for_sale' ? 'bg-emerald-100 text-emerald-700' :
                            (property.status ?? 'for_sale') === 'pending' || (property.status ?? 'for_sale') === 'under_offer' ? 'bg-yellow-100 text-yellow-700' :
                            (property.status ?? 'for_sale') === 'sold' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'}`}
                        >
                          {formatStatus(property.status ?? 'for_sale')}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{formatPrice(property.price)}</h3>
                          <p className="text-gray-600">{property.address.street}</p>
                          <p className="text-gray-500 text-sm">{property.address.city}, {property.address.postcode}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span>{property.specs.bedrooms} beds</span>
                        <span>{property.specs.bathrooms} baths</span>
                        <span>{property.specs.square_footage} sq ft</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{property.viewings || 0} viewings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{property.inquiries || 0} inquiries</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/seller-dashboard/edit-property/${property.id}`);
                          }}
                          className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
                        >
                          Manage Property
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProperty(property.id);
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-700 border rounded"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State Message - Always show when there are no properties */}
                {properties.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200 h-80">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                      {debouncedSearchTerm || selectedFilter !== 'all' ? (
                        <p className="text-gray-600">No properties match your current filters.</p>
                      ) : (
                        <p className="text-gray-600">You haven't added any properties yet. Click the "Add New Property" card to get started.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <PersistentChat />
    </div>
  );
};

export default SellerPropertyGrid; 