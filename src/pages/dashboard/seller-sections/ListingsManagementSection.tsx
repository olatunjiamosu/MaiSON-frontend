import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import PropertyService from '../../../services/PropertyService';
import { PropertySummary, PropertyFilters } from '../../../types/property';
import { toast } from 'react-hot-toast';

// Define property status type
type PropertyStatus = 'active' | 'pending' | 'sold' | 'withdrawn';

// Extended PropertySummary with status
interface PropertyWithStatus extends PropertySummary {
  status: PropertyStatus;
  viewings?: number;
  inquiries?: number;
  favorites?: number;
}

const ListingsManagementSection = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  // Set up debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get user ID on component mount
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setUserId(Number(user.uid) || 1); // Fallback to 1 if conversion fails
    } else {
      setError('You must be logged in to view your properties');
    }
  }, []);

  // Fetch user properties with filters
  const fetchUserProperties = useCallback(async (refresh = false) => {
    if (!userId) return;
    
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      // Create filters object based on current search and filter selections
      const filters: PropertyFilters = {};
      
      // Add property type filter if search term matches a property type
      if (debouncedSearchTerm) {
        // Check if search term might be a property type
        const propertyTypes = ['house', 'flat', 'apartment', 'bungalow', 'cottage', 'mansion'];
        const matchedType = propertyTypes.find(type => 
          debouncedSearchTerm.toLowerCase().includes(type.toLowerCase())
        );
        
        if (matchedType) {
          filters.property_type = matchedType;
        } else {
          // Otherwise, assume it's a city search
          filters.city = debouncedSearchTerm;
        }
      }
      
      // Get properties from API
      const propertiesData: PropertySummary[] = await PropertyService.getUserProperties(userId);
      
      // Add status and stats to properties (these would come from the API in a real implementation)
      const propertiesWithStatus: PropertyWithStatus[] = propertiesData.map(property => ({
        ...property,
        status: 'active' as PropertyStatus, // Default to active for now
        viewings: Math.floor(Math.random() * 20), // Mock data
        inquiries: Math.floor(Math.random() * 10), // Mock data
        favorites: Math.floor(Math.random() * 15) // Mock data
      }));
      
      // Apply status filter client-side if needed
      let filteredProperties = propertiesWithStatus;
      if (selectedFilter !== 'all') {
        filteredProperties = propertiesWithStatus.filter(property => 
          property.status === selectedFilter
        );
      }
      
      // Apply additional client-side filtering for search terms that don't match property type or city
      if (debouncedSearchTerm && !filters.property_type && !filters.city) {
        const term = debouncedSearchTerm.toLowerCase();
        filteredProperties = filteredProperties.filter(property => 
          property.address.street.toLowerCase().includes(term) ||
          property.address.city.toLowerCase().includes(term) ||
          property.address.postcode.toLowerCase().includes(term) ||
          property.specs.property_type.toLowerCase().includes(term)
        );
      }
      
      setProperties(filteredProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, debouncedSearchTerm, selectedFilter]);

  // Fetch properties when filters change or component mounts
  useEffect(() => {
    if (userId) {
      fetchUserProperties();
    }
  }, [userId, debouncedSearchTerm, selectedFilter, fetchUserProperties]);

  // Handle property deletion
  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await PropertyService.deleteProperty(id);
        setProperties(prev => prev.filter(property => property.id !== id));
        toast.success('Property deleted successfully');
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchUserProperties(true);
  };

  // Format price to GBP
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Properties</h2>
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-emerald-600 disabled:text-gray-300"
            title="Refresh properties"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <p className="text-gray-500">Manage your property listings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Properties</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          
          <Link to="/seller-dashboard/add-property" className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && properties.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          {debouncedSearchTerm || selectedFilter !== 'all' ? (
            <p className="text-gray-600 mb-6">No properties match your current filters.</p>
          ) : (
            <p className="text-gray-600 mb-6">You haven't added any properties yet.</p>
          )}
          {!debouncedSearchTerm && selectedFilter === 'all' && (
            <Link to="/seller-dashboard/add-property" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Plus className="h-5 w-5" />
              <span>Add Your First Property</span>
            </Link>
          )}
        </div>
      )}

      {/* Property Cards Grid */}
      {!isLoading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              {/* Property Image */}
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
                    ${property.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      property.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'}`}
                  >
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{formatPrice(property.price)}</h3>
                    <p className="text-gray-600">{property.address.street}</p>
                    <p className="text-gray-500 text-sm">{property.address.city}, {property.address.postcode}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Property Specs */}
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  <span>{property.specs.square_footage} sq ft</span>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span>{property.viewings || 0} viewings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{property.inquiries || 0} inquiries</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/seller-dashboard/edit-property/${property.id}`)}
                    className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
                  >
                    Edit Details
                  </button>
                  <Link 
                    to={`/property/${property.id}`}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 border rounded"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteProperty(property.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 border rounded"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsManagementSection; 