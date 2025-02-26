import React, { useState, useEffect } from 'react';
import { Search, Home, Bed, Bath, Square, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import FilterModal from '../components/search/FilterModal';
import PersistentChat from '../components/chat/PersistentChat';
import PropertyService from '../services/PropertyService';
import { PropertySummary, PropertyFilters } from '../types/property';
import { formatPrice } from '../lib/formatters';

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

const PublicListings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<PropertyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({
    min_price: undefined,
    max_price: undefined,
    bedrooms: undefined,
    property_type: undefined
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const apiProperties = await PropertyService.getProperties(filters);
        
        // Transform API properties to the display format
        const transformedProperties = apiProperties.map(property => {
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
            reception: specs.reception_rooms,
            sqft: property.specs.square_footage,
            propertyType: property.specs.property_type
          };
        });
        
        setProperties(transformedProperties);
        setError(null);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
        // Use mock data as fallback
        setProperties(mockProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update filters based on search term
    // This is a simple implementation - you might want to enhance this
    setFilters({
      ...filters,
      city: searchTerm
    });
  };

  const handleApplyFilters = (newFilters: any) => {
    setShowFilters(false);
    
    // Transform UI filters to API filters
    const apiFilters: PropertyFilters = {
      min_price: newFilters.priceRange === 'Under £300,000' ? 0 : 
                newFilters.priceRange === '£300,000 - £500,000' ? 300000 : 
                newFilters.priceRange === '£500,000 - £750,000' ? 500000 : 
                newFilters.priceRange === '£750,000 - £1,000,000' ? 750000 : 
                newFilters.priceRange === 'Over £1,000,000' ? 1000000 : undefined,
      
      max_price: newFilters.priceRange === 'Under £300,000' ? 300000 : 
                newFilters.priceRange === '£300,000 - £500,000' ? 500000 : 
                newFilters.priceRange === '£500,000 - £750,000' ? 750000 : 
                newFilters.priceRange === '£750,000 - £1,000,000' ? 1000000 : undefined,
      
      bedrooms: newFilters.bedrooms === 'Any' ? undefined : parseInt(newFilters.bedrooms),
      
      property_type: newFilters.propertyType === 'Any' ? undefined : newFilters.propertyType.toLowerCase()
    };
    
    setFilters(apiFilters);
  };

  // Mock data as fallback
  const mockProperties: PropertyDisplay[] = [
    {
      id: '1',
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
      ],
      price: '£450,000',
      address: '123 Park Avenue',
      postcode: 'SE22 9QA',
      beds: 3,
      baths: 2,
      reception: 1,
      sqft: 1200,
      propertyType: 'Semi-Detached'
    },
    {
      id: '2',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      ],
      price: '£650,000',
      address: "45 Queen's Road",
      postcode: 'SW19 8LR',
      beds: 4,
      baths: 3,
      reception: 2,
      sqft: 1800,
      propertyType: 'Detached'
    },
    {
      id: '3',
      images: [
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
      ],
      price: '£350,000',
      address: '12 Victoria Street',
      postcode: 'E1 6QE',
      beds: 2,
      baths: 1,
      reception: 1,
      sqft: 850,
      propertyType: 'Flat'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          </form>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}
        
        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* Property listings */}
        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-12">
            <Home className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
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
                />
                <div className="absolute bottom-0 left-0 bg-emerald-600 text-white px-4 py-2 font-semibold">
                  {property.price}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{property.address}</h3>
                    <p className="text-gray-500 text-sm">{property.postcode}</p>
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                    {property.propertyType}
                  </span>
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
        currentFilters={filters}
      />
      
      <PersistentChat />
    </div>
  );
};

export default PublicListings; 