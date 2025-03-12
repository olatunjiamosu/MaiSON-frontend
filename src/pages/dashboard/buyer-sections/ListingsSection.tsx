import React, { useState, useEffect, useCallback } from 'react';
import PropertyCard from '../../../components/property/PropertyCard';
import {
  Grid,
  List,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Loader2,
  Bell,
  Map,
  RefreshCw,
} from 'lucide-react';
import SaveSearchModal from '../../../components/search/SaveSearchModal';
import PropertyMap from '../../../components/map/PropertyMap';
import PersistentChat from '../../../components/chat/PersistentChat';
import PropertyService from '../../../services/PropertyService';
import { PropertySummary, PropertyFilters, Negotiation } from '../../../types/property';
import { formatPrice } from '../../../lib/formatters';

// Define the Property interface for display
interface PropertyDisplay {
  id: string;
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
  lat: number;
  lng: number;
}

// Expand sort options
type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'beds-desc'
  | 'size-desc'
  | 'popular'
  | 'epc-desc'
  | 'garden-size';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'beds-desc', label: 'Most Bedrooms' },
  { value: 'size-desc', label: 'Largest Size' },
  { value: 'epc-desc', label: 'Best EPC Rating' },
  { value: 'garden-size', label: 'Largest Garden' },
] as const;

type ViewMode = 'grid' | 'list' | 'map';

// Default filter values
const DEFAULT_FILTERS = {
  priceRange: { min: 0, max: 2000000 },
  cityLocation: '',
  squareFootage: { min: 0, max: 10000 },
  epcRating: 'any',
  bedrooms: 'any',
  bathrooms: 'any',
  receptionRooms: 'any',
  propertyType: 'any',
  gardenPreference: 'any',
  parkingSpaces: 'any',
};

// Update the ListingsSection props
interface ListingsSectionProps {
  initialProperties?: PropertySummary[];
}

// Match the PropertyMap component's Property interface
interface MapProperty {
  id: string;
  lat: number;
  lng: number;
  price: string;
  image: string;
  beds: number;
  propertyType: string;
}

const ListingsSection: React.FC<ListingsSectionProps> = ({ initialProperties }) => {
  const [properties, setProperties] = useState<PropertySummary[]>(initialProperties || []);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [apiFilters, setApiFilters] = useState<PropertyFilters>({});
  const [sortOption, setSortOption] = useState<string>('price-asc');
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [savedPropertiesLoading, setSavedPropertiesLoading] = useState(true);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await PropertyService.getUserDashboard();
        setNegotiations(dashboardData.negotiations_as_buyer);
        const savedIds = new Set(dashboardData.saved_properties.map(prop => prop.property_id));
        setSavedPropertyIds(savedIds);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setSavedPropertiesLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Load filters from localStorage on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('propertyFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
        // Apply saved filters immediately
        convertFiltersToApiFormat(parsedFilters);
      } catch (e) {
        console.error('Error parsing saved filters', e);
        // If there's an error, just use default filters
        localStorage.removeItem('propertyFilters');
      }
    }
    
    const savedSort = localStorage.getItem('propertySortBy');
    if (savedSort) {
      setSortOption(savedSort as string);
    }
    
    const savedViewMode = localStorage.getItem('propertyViewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode as ViewMode);
    }
  }, []);
  
  // Convert UI filters to API format
  const convertFiltersToApiFormat = (uiFilters: typeof filters) => {
    // Transform UI filters to API filters - make sure field names match API exactly
    const newApiFilters: PropertyFilters = {
      min_price: uiFilters.priceRange.min > 0 ? uiFilters.priceRange.min : undefined,
      max_price: uiFilters.priceRange.max < 2000000 ? uiFilters.priceRange.max : undefined,
      bedrooms: uiFilters.bedrooms !== 'any' ? parseInt(uiFilters.bedrooms) : undefined,
      bathrooms: uiFilters.bathrooms !== 'any' ? parseInt(uiFilters.bathrooms) : undefined,
      city: uiFilters.cityLocation || undefined, // Now using cityLocation
      property_type: uiFilters.propertyType !== 'any' ? uiFilters.propertyType : undefined,
      has_garden: uiFilters.gardenPreference === 'required' ? true : undefined,
      parking_spaces: uiFilters.parkingSpaces !== 'any' ? parseInt(uiFilters.parkingSpaces) : undefined,
    };
    
    setApiFilters(newApiFilters);
    
    // Count active filters for display
    let count = 0;
    if (uiFilters.priceRange.min > 0) count++;
    if (uiFilters.priceRange.max < 2000000) count++;
    if (uiFilters.cityLocation) count++; // Updated to cityLocation
    if (uiFilters.bedrooms !== 'any') count++;
    if (uiFilters.bathrooms !== 'any') count++;
    if (uiFilters.propertyType !== 'any') count++;
    if (uiFilters.gardenPreference !== 'any') count++;
    if (uiFilters.parkingSpaces !== 'any') count++;
    setActiveFilterCount(count);
  };

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiProperties = await PropertyService.getProperties(apiFilters);
        setProperties(apiProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to fetch properties. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [apiFilters]);

  // Save sort option to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('propertySortBy', sortOption);
  }, [sortOption]);
  
  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('propertyViewMode', viewMode);
  }, [viewMode]);

  // Add sorting function
  const getSortedProperties = () => {
    return [...properties].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'beds-asc':
          return a.specs.bedrooms - b.specs.bedrooms;
        case 'beds-desc':
          return b.specs.bedrooms - a.specs.bedrooms;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  // Handle sort change and save to localStorage
  const handleSortChange = (newSort: string) => {
    setIsLoading(true);
    setSortOption(newSort);
    localStorage.setItem('propertySortBy', newSort);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Apply filters and save to localStorage
  const applyFilters = () => {
    setIsLoading(true);
    convertFiltersToApiFormat(filters);
    localStorage.setItem('propertyFilters', JSON.stringify(filters));
    setShowFilters(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    convertFiltersToApiFormat(DEFAULT_FILTERS);
    localStorage.removeItem('propertyFilters');
    setShowFilters(false);
  };

  // Add save search handler
  const handleSaveSearch = (name: string, notifyNewMatches: boolean) => {
    // This will eventually connect to your backend
    const searchToSave = {
      id: Date.now().toString(),
      name,
      notifyNewMatches,
      filters: { ...filters },
      sortBy: sortOption,
      createdAt: new Date().toISOString(),
    };

    console.log('Saving search:', searchToSave);
    // TODO: Save to backend
    setShowSaveSearchModal(false);
  };
  
  // Handle retry when API call fails
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // This will trigger the useEffect to fetch properties again
    setApiFilters({...apiFilters});
  };

  // Transform properties for map view
  const getMapProperties = (): MapProperty[] => {
    return getSortedProperties().map(p => ({
      id: p.id,
      lat: p.address.latitude || 51.5074 + (Math.random() - 0.5) * 0.1, // Default to London with slight randomization if no coords
      lng: p.address.longitude || -0.1278 + (Math.random() - 0.5) * 0.1,
      price: formatPrice(p.price),
      image: p.main_image_url || '/placeholder-property.jpg',
      beds: p.specs.bedrooms,
      propertyType: p.specs.property_type
    }));
  };

  // Function to handle toggling save status
  const handleToggleSave = async (propertyId: string) => {
    try {
      // If already saved, unsave it
      if (savedPropertyIds.has(propertyId)) {
        await PropertyService.unsaveProperty(propertyId);
        setSavedPropertyIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      } else {
        // Otherwise save it
        await PropertyService.saveProperty(propertyId);
        setSavedPropertyIds(prev => {
          const newSet = new Set(prev);
          newSet.add(propertyId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      // Could add toast notification here for error
    }
  };

  return (
    <div className="pb-24">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            Available Properties
            {isLoading && (
              <Loader2 className="ml-2 h-5 w-5 inline animate-spin text-emerald-600" />
            )}
            {activeFilterCount > 0 && (
              <span className="ml-3 text-sm font-medium bg-emerald-100 text-emerald-800 py-1 px-2 rounded-full">
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
              </span>
            )}
          </h2>
          <div className="flex items-center gap-4">
            {/* Enhanced Sort Dropdown */}
            <div className="relative group">
              <select
                value={sortOption}
                onChange={e => handleSortChange(e.target.value)}
                className="appearance-none bg-white px-4 py-2 pr-8 border rounded-lg 
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500
                  transition-all duration-200 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none
                transition-transform duration-200 group-hover:scale-110"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
              <button
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded transition-colors ${
                  viewMode === 'map'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => setViewMode('map')}
              >
                <Map className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Button */}
            <button
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                showFilters
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-600'
                  : ''
              } ${
                activeFilterCount > 0 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : ''
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>

            {/* Add Save Search button */}
            <button
              onClick={() => setShowSaveSearchModal(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Bell className="h-5 w-5" />
              <span>Save Search</span>
            </button>
          </div>
        </div>

        {/* Error message with retry button */}
        {error && !isLoading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="flex items-center gap-1 text-sm font-medium bg-red-200 text-red-800 px-3 py-1 rounded hover:bg-red-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {/* Updated Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Location - renamed to City Location for clarity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  className="w-full p-2 border rounded"
                  value={filters.cityLocation}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      cityLocation: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border rounded"
                    value={filters.priceRange.min}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          min: Number(e.target.value),
                        },
                      }))
                    }
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border rounded"
                    value={filters.priceRange.max}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          max: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Square Footage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min sq ft"
                    className="w-full p-2 border rounded"
                    value={filters.squareFootage.min}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        squareFootage: {
                          ...prev.squareFootage,
                          min: Number(e.target.value),
                        },
                      }))
                    }
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max sq ft"
                    className="w-full p-2 border rounded"
                    value={filters.squareFootage.max}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        squareFootage: {
                          ...prev.squareFootage,
                          max: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.bedrooms}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, bedrooms: e.target.value }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.bathrooms}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, bathrooms: e.target.value }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Reception Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reception Rooms
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.receptionRooms}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      receptionRooms: e.target.value,
                    }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.propertyType}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      propertyType: e.target.value,
                    }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="house">House</option>
                  <option value="flat">Flat</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="maisonette">Maisonette</option>
                </select>
              </div>

              {/* Garden Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garden
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.gardenPreference}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      gardenPreference: e.target.value,
                    }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="required">Required</option>
                  <option value="preferred">Preferred</option>
                  <option value="not_required">Not Required</option>
                </select>
              </div>

              {/* Parking Spaces - Added new filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.parkingSpaces}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      parkingSpaces: e.target.value,
                    }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* EPC Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EPC Rating
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.epcRating}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, epcRating: e.target.value }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Properties Grid - Display Loading Skeletons */}
        {isLoading && viewMode !== 'map' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`animate-pulse ${viewMode === 'list' ? 'flex gap-6' : ''}`}>
                <div className={`bg-gray-200 rounded-md ${viewMode === 'list' ? 'w-64 h-36 flex-shrink-0' : 'aspect-video mb-3'}`}></div>
                <div className={viewMode === 'list' ? 'flex-grow' : ''}>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="mt-2 flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Properties Display */}
        {!isLoading && (
          <>
            {/* Empty state when no properties are found */}
            {properties.length === 0 && !isLoading && !error && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <SlidersHorizontal className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  {activeFilterCount > 0 
                    ? 'Try adjusting your filters to see more properties' 
                    : 'There are currently no properties matching your criteria'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Grid View */}
            {properties.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getSortedProperties().map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    className="grid"
                    showSaveButton={true}
                    isSaved={savedPropertyIds.has(property.id)}
                    onToggleSave={handleToggleSave}
                    negotiations={negotiations}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {properties.length > 0 && viewMode === 'list' && (
              <div className="space-y-6">
                {getSortedProperties().map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    className="flex"
                    showSaveButton={true}
                    isSaved={savedPropertyIds.has(property.id)}
                    onToggleSave={handleToggleSave}
                    negotiations={negotiations}
                  />
                ))}
              </div>
            )}

            {/* Map View */}
            {properties.length > 0 && viewMode === 'map' && (
              <div className="h-[600px] relative rounded-lg overflow-hidden">
                <PropertyMap
                  properties={getMapProperties()}
                  selectedProperty={selectedProperty}
                  onPropertySelect={(id) => setSelectedProperty(id)}
                />
              </div>
            )}
          </>
        )}
        
        {/* Pagination or Load More (future enhancement) */}
        {properties.length > 0 && !isLoading && (
          <div className="mt-8 flex justify-center">
            <p className="text-gray-600">
              Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <SaveSearchModal
          isOpen={showSaveSearchModal}
          onClose={() => setShowSaveSearchModal(false)}
          onSave={handleSaveSearch}
          currentFilters={filters}
        />
      )}
    </div>
  );
};

export default ListingsSection;
