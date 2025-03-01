import React, { useState, useEffect, useCallback } from 'react';
import { Search, Home, Bed, Bath, Square, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import FilterModal from '../components/search/FilterModal';
import PersistentChat from '../components/chat/PersistentChat';
import PropertyService from '../services/PropertyService';
import { PropertySummary, PropertyFilters } from '../types/property';
import { formatPrice } from '../lib/formatters';
import Footer from '../components/layout/Footer';

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

// Pagination settings
const PAGE_SIZES = [12, 24, 48];

// Local storage keys
const STORAGE_KEYS = {
  FILTERS: 'property_filters',
  UI_FILTERS: 'property_ui_filters',
  SEARCH_TERM: 'property_search_term',
  PAGE_SIZE: 'property_page_size',
  CURRENT_PAGE: 'property_current_page'
};

const PublicListings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<PropertyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
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
    
    // Load pagination settings
    const savedPageSize = localStorage.getItem(STORAGE_KEYS.PAGE_SIZE);
    if (savedPageSize) {
      const parsedPageSize = parseInt(savedPageSize, 10);
      if (!isNaN(parsedPageSize) && PAGE_SIZES.includes(parsedPageSize)) {
        setPageSize(parsedPageSize);
      }
    }
    
    const savedCurrentPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
    if (savedCurrentPage) {
      const parsedCurrentPage = parseInt(savedCurrentPage, 10);
      if (!isNaN(parsedCurrentPage) && parsedCurrentPage > 0) {
        setCurrentPage(parsedCurrentPage);
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
  
  // Save pagination settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, pageSize.toString());
  }, [pageSize]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage.toString());
  }, [currentPage]);

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
      
      // Reset to first page when search changes
      setCurrentPage(1);
    } else {
      // Clear city and property_type filters when search is empty
      setFilters(prev => ({ ...prev, city: undefined, property_type: undefined }));
    }
  }, [debouncedSearchTerm]);

  // Fetch properties with current filters and pagination
  const fetchProperties = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Add pagination parameters to the API call
      const paginatedFilters = {
        ...filters,
        page: currentPage,
        limit: pageSize
      };
      
      const apiResponse = await PropertyService.getProperties(paginatedFilters);
      
      // In a real implementation, the API would return pagination metadata
      // For now, we'll simulate it based on the returned data
      // This should be updated once the API supports pagination
      const totalCount = apiResponse.length * 3; // Simulate more data
      setTotalProperties(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize));
      
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
          beds: property.bedrooms,
          baths: property.bathrooms,
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
  }, [filters, currentPage, pageSize]);

  // Fetch properties when filters or pagination changes
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties, currentPage, pageSize]);

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
    
    // Reset to first page when filters change
    setCurrentPage(1);
    setFilters(apiFilters);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
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
    setCurrentPage(1);
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
    localStorage.removeItem(STORAGE_KEYS.UI_FILTERS);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_TERM);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE);
    // Keep page size as user preference
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
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
        
        {/* Results count and page size selector */}
        {!loading && !error && properties.length > 0 && (
          <div className="mb-4 max-w-4xl mx-auto flex justify-between items-center">
            <p className="text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalProperties)} of {totalProperties} properties
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">Show:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border rounded p-1 text-sm"
              >
                {PAGE_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
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
        
        {/* Pagination controls */}
        {!loading && !error && properties.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md ${
                        currentPage === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {/* Show ellipsis if there are more pages */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2">...</span>
                )}
                
                {/* Always show last page if not visible in the range */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 flex items-center justify-center rounded-md border hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
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
  );
};

export default PublicListings; 