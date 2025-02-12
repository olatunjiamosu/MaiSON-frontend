import React, { useState } from 'react';
import PropertyCard from '../../../components/property/PropertyCard';
import { Grid, List, SlidersHorizontal, X, ArrowUpDown, Loader2, Bell, Map } from 'lucide-react';
import SaveSearchModal from '../../../components/search/SaveSearchModal';
import PropertyMap from '../../../components/map/PropertyMap';

// Mock data
const mockProperties = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    price: "£800,000",
    road: "123 Park Avenue",
    city: "London",
    postcode: "SE22 9QA",
    beds: 2,
    baths: 2,
    reception: 1,
    sqft: 1200,
    propertyType: "Terraced",
    epcRating: "C",
    lat: 51.5074,
    lng: -0.1278
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    price: "£950,000",
    road: "456 Oak Street",
    city: "London",
    postcode: "NW3 5TB",
    beds: 3,
    baths: 2,
    reception: 2,
    sqft: 1500,
    propertyType: "Semi-Detached",
    epcRating: "B",
    lat: 51.5074,
    lng: -0.1278
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    price: "£1,200,000",
    road: "789 Maple Road",
    city: "London",
    postcode: "W1 7YX",
    beds: 4,
    baths: 3,
    reception: 2,
    sqft: 2000,
    propertyType: "Detached",
    epcRating: "A",
    lat: 51.5074,
    lng: -0.1278
  }
];

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

// Define the Property interface
interface Property {
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

// Update the ListingsSection props
interface ListingsSectionProps {
  properties: Property[];
}

const ListingsSection: React.FC<ListingsSectionProps> = ({ properties }) => {
  // Ensure properties is an array
  console.log('Received Properties:', properties);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Start with false
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 2000000 },
    location: '',
    squareFootage: { min: 0, max: 10000 },
    epcRating: 'any',
    bedrooms: 'any',
    bathrooms: 'any',
    receptionRooms: 'any',
    propertyType: 'any',
    gardenPreference: 'any'
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>();

  // Add sorting function
  const getSortedProperties = () => {
    return [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''));
        case 'price-desc':
          return parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''));
        case 'beds-desc':
          return b.beds - a.beds;
        case 'size-desc':
          return b.sqft - a.sqft;
        case 'newest':
        default:
          return 0; // Will use backend sorting for newest
      }
    });
  };

  // Simulate loading when sorting changes
  const handleSortChange = (newSort: SortOption) => {
    setIsLoading(true);
    setSortBy(newSort);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Add save search handler
  const handleSaveSearch = (name: string, notifyNewMatches: boolean) => {
    // This will eventually connect to your backend
    const searchToSave = {
      id: Date.now().toString(),
      name,
      notifyNewMatches,
      filters: { ...filters },
      sortBy,
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving search:', searchToSave);
    // TODO: Save to backend
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Available Properties
          {isLoading && (
            <Loader2 className="ml-2 h-5 w-5 inline animate-spin text-emerald-600" />
          )}
        </h2>
        <div className="flex items-center gap-4">
          {/* Enhanced Sort Dropdown */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none
              transition-transform duration-200 group-hover:scale-110">
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
              showFilters ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : ''
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
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

      {/* Updated Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button 
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter postcode or area"
                className="w-full p-2 border rounded"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  location: e.target.value
                }))}
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
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                  }))}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full p-2 border rounded"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
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
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    squareFootage: { ...prev.squareFootage, min: Number(e.target.value) }
                  }))}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max sq ft"
                  className="w-full p-2 border rounded"
                  value={filters.squareFootage.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    squareFootage: { ...prev.squareFootage, max: Number(e.target.value) }
                  }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, receptionRooms: e.target.value }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, gardenPreference: e.target.value }))}
              >
                <option value="any">Any</option>
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
                <option value="not_required">Not Required</option>
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
                onChange={(e) => setFilters(prev => ({ ...prev, epcRating: e.target.value }))}
              >
                <option value="any">Any</option>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
                <option value="e">E</option>
              </select>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <button
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Property Grid/List with animation */}
      {viewMode === 'map' ? (
        <div className="h-[calc(100vh-200px)]">
          <PropertyMap
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={setSelectedProperty}
          />
        </div>
      ) : (
        <div 
          className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
            transition-all duration-300 ease-in-out
          `}
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          {getSortedProperties().map(property => (
            <div
              key={property.id}
              className="transition-all duration-300 ease-in-out transform"
            >
              <PropertyCard 
                {...property} 
                className={viewMode === 'list' ? 'flex' : ''}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      )}

      {/* Add SaveSearchModal */}
      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        onSave={handleSaveSearch}
        currentFilters={filters}
      />
    </div>
  );
};

export default ListingsSection;