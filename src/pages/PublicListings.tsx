import React, { useState, useEffect, useCallback } from 'react';
import { Search, Home, Bed, Bath, Square, SlidersHorizontal, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import FilterModal from '../components/search/FilterModal';
import PersistentChat from '../components/chat/PersistentChat';
import PropertyService from '../services/PropertyService';
import { PropertySummary, PropertyFilters } from '../types/property';
import { formatPrice } from '../lib/formatters';
import Footer from '../components/layout/Footer';
import PageTitle from '../components/PageTitle';

// Interface for the component's property display
interface PropertyDisplay {
  id: string;
  images: string[];
  price: string;
  address: string;
  postcode: string;
  beds: number;
  baths: number;
  reception: number;
  sqft: number;
  propertyType: string;
}

// Local storage keys
const STORAGE_KEYS = {
  FILTERS: 'property_filters',
  UI_FILTERS: 'property_ui_filters',
  SEARCH_TERM: 'property_search_term'
};

const PublicListings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSellerDashboard = location.search?.includes('from=seller-dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<PropertyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API filters
  const [filters, setFilters] = useState<PropertyFilters>({
    min_price: undefined,
    max_price: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    property_type: undefined,
    city: undefined,
    has_garden: undefined,
    parking_spaces: undefined
  });
  
  // UI filters for filter modal
  const [uiFilters, setUiFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: 'Any',
    bathrooms: 'Any',
    propertyType: 'Any',
    location: '',
    minSqft: '',
    maxSqft: '',
    garden: 'Any',
    epcRating: 'Any',
    parkingSpaces: 'Any',
    receptionRooms: 'Any'
  });

  // Load saved filters and settings from localStorage on component mount
  useEffect(() => {
    // Load search term
    const savedSearchTerm = localStorage.getItem(STORAGE_KEYS.SEARCH_TERM);
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
    }
    
    // Load API filters
    const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (err) {
        console.error('Error parsing saved filters:', err);
      }
    }
    
    // Load UI filters
    const savedUiFilters = localStorage.getItem(STORAGE_KEYS.UI_FILTERS);
    if (savedUiFilters) {
      try {
        const parsedUiFilters = JSON.parse(savedUiFilters);
        setUiFilters(parsedUiFilters);
      } catch (err) {
        console.error('Error parsing saved UI filters:', err);
      }
    }
  }, []);

  // Save search term to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  }, [filters]);
  
  // Save UI filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UI_FILTERS, JSON.stringify(uiFilters));
  }, [uiFilters]);

  // Set up debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Check if search term might be a property type
      const propertyTypes = ['house', 'flat', 'apartment', 'bungalow', 'cottage', 'mansion'];
      const matchedType = propertyTypes.find(type => 
        debouncedSearchTerm.toLowerCase().includes(type.toLowerCase())
      );
      
      if (matchedType) {
        setFilters(prev => ({ ...prev, property_type: matchedType }));
      } else {
        // Otherwise, assume it's a city search
        setFilters(prev => ({ ...prev, city: debouncedSearchTerm }));
      }
    } else {
      // Clear city and property_type filters when search is empty
      setFilters(prev => ({ ...prev, city: undefined, property_type: undefined }));
    }
  }, [debouncedSearchTerm]);

  // Fetch properties with current filters
  const fetchProperties = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const apiResponse = await PropertyService.getProperties(filters);
      
      // Transform API properties to the display format
      const transformedProperties = apiResponse.map(property => {
        // Create a safe property specs object with defaults
        const specs = {
          reception_rooms: 1,
          ...property.specs
        };
        
        return {
          id: property.id,
          images: property.main_image_url ? [property.main_image_url] : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
          price: formatPrice(property.price),
          address: property.address.street,
          postcode: property.address.postcode,
          beds: property.specs.bedrooms,
          baths: property.specs.bathrooms,
          reception: specs.reception_rooms || 1,
          sqft: property.specs.square_footage,
          propertyType: property.specs.property_type
        };
      });
      
      setProperties(transformedProperties);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled via the debounced term in useEffect
  };

  const handleRefresh = () => {
    fetchProperties(true);
  };

  // Apply filters from the modal
  const handleApplyFilters = (newFilters: any) => {
    setShowFilters(false);
    
    // Update UI filters
    setUiFilters(newFilters);
    
    // Transform UI filters to API filters
    const apiFilters: PropertyFilters = {
      min_price: newFilters.minPrice ? Number(newFilters.minPrice) : undefined,
      max_price: newFilters.maxPrice ? Number(newFilters.maxPrice) : undefined,
      bedrooms: newFilters.bedrooms !== 'Any' ? Number(newFilters.bedrooms) : undefined,
      bathrooms: newFilters.bathrooms !== 'Any' ? Number(newFilters.bathrooms) : undefined,
      property_type: newFilters.propertyType !== 'Any' ? newFilters.propertyType.toLowerCase() : undefined,
      city: newFilters.location || undefined,
      has_garden: newFilters.garden === 'Yes' ? true : newFilters.garden === 'No' ? false : undefined,
      parking_spaces: newFilters.parkingSpaces !== 'Any' ? Number(newFilters.parkingSpaces) : undefined
    };
    
    setFilters(apiFilters);
  };

  // Clear all filters and reset localStorage
  const clearAllFilters = () => {
    // Clear filters
    setFilters({});
    setUiFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: 'Any',
      bathrooms: 'Any',
      propertyType: 'Any',
      location: '',
      minSqft: '',
      maxSqft: '',
      garden: 'Any',
      epcRating: 'Any',
      parkingSpaces: 'Any',
      receptionRooms: 'Any'
    });
    setSearchTerm('');
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
    localStorage.removeItem(STORAGE_KEYS.UI_FILTERS);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_TERM);
  };

  return (
    <>
      <PageTitle title="Property Listings" />
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
          {/* Back to Dashboard link when coming from seller dashboard */}
          {fromSellerDashboard && (
            <div className="mb-4">
              <button 
                onClick={() => navigate('/seller-dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          )}
          
          {/* Search and filter bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by location or property type..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-emerald-600 disabled:text-gray-300 rounded-md"
                title="Refresh properties"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </form>
          </div>
          
          {/* Active filters display */}
          {(filters.min_price || filters.max_price || filters.bedrooms || filters.bathrooms || 
            filters.property_type || filters.city || filters.has_garden || filters.parking_spaces) && (
            <div className="flex flex-wrap gap-2 mb-4 max-w-4xl mx-auto">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.min_price && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Min price: {formatPrice(filters.min_price)}
                </span>
              )}
              {filters.max_price && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Max price: {formatPrice(filters.max_price)}
                </span>
              )}
              {filters.bedrooms && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Bedrooms: {filters.bedrooms}+
                </span>
              )}
              {filters.bathrooms && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Bathrooms: {filters.bathrooms}+
                </span>
              )}
              {filters.property_type && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Type: {filters.property_type}
                </span>
              )}
              {filters.city && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Location: {filters.city}
                </span>
              )}
              {filters.has_garden !== undefined && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Garden: {filters.has_garden ? 'Yes' : 'No'}
                </span>
              )}
              {filters.parking_spaces !== undefined && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  Parking: {filters.parking_spaces}+
                </span>
              )}
              <button 
                onClick={clearAllFilters}
                className="text-sm text-emerald-600 hover:text-emerald-800"
              >
                Clear all
              </button>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          )}
          
          {/* Error state with retry button */}
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
              <p>{error}</p>
              <button 
                onClick={handleRefresh} 
                className="ml-4 px-3 py-1 bg-red-50 border border-red-300 rounded text-red-700 hover:bg-red-100 flex items-center"
              >
                <RefreshCw size={16} className="mr-1" /> Retry
              </button>
            </div>
          )}
          
          {/* No properties found state */}
          {!loading && !error && properties.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <div className="flex justify-center mb-4">
                <SlidersHorizontal className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                {(filters.min_price || filters.max_price || filters.bedrooms || filters.bathrooms || 
                 filters.property_type || filters.city || filters.has_garden || filters.parking_spaces)
                  ? 'Try adjusting your filters to see more properties' 
                  : 'There are currently no properties matching your criteria'}
              </p>
              {(filters.min_price || filters.max_price || filters.bedrooms || filters.bathrooms || 
               filters.property_type || filters.city || filters.has_garden || filters.parking_spaces) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
          
          {/* Results count */}
          {!loading && !error && properties.length > 0 && (
            <div className="mb-4 max-w-4xl mx-auto">
              <p className="text-gray-600">
                Showing {properties.length} properties
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading && properties.map((property) => (
              <div 
                key={property.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <div className="relative h-64">
                  <img 
                    src={property.images[0]} 
                    alt={`${property.address}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-property.jpg';
                    }}
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 bg-emerald-600 text-white px-4 py-2 font-semibold">
                    {property.price}
                  </div>
                  {property.propertyType && (
                    <div className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 m-2 rounded">
                      {property.propertyType}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{property.address}</h3>
                      <p className="text-gray-500 text-sm">{property.postcode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 text-gray-700">
                    <div className="flex items-center">
                      <Bed size={18} className="mr-2" />
                      <span>{property.beds}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath size={18} className="mr-2" />
                      <span>{property.baths}</span>
                    </div>
                    <div className="flex items-center">
                      <Square size={18} className="mr-2" />
                      <span>{property.sqft} sq ft</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Filter modal */}
        <FilterModal 
          isOpen={showFilters}
          onClose={() => setShowFilters(false)} 
          onApply={handleApplyFilters}
          currentFilters={uiFilters}
        />
        
        <PersistentChat />
        <Footer />
      </div>
    </>
  );
};

export default PublicListings; 