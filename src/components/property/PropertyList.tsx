import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import PropertyFilter from './PropertyFilter';
import { PropertySummary } from '../../types/property';

// Define the filter state interface
interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  minBathrooms: number | null;
  propertyTypes: string[];
  hasGarden: boolean | null;
  hasParking: boolean | null;
}

// Define possible sort options
type SortOption = 'price_low_to_high' | 'price_high_to_low' | 'newest' | 'oldest';

// Test property type 
interface TestProperty {
  id: string;
  main_image_url: string;
  price: number;
  address: {
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    postcode?: string;
  };
  specs?: {
    square_feet?: number;
    has_garden?: boolean;
    has_parking?: boolean;
    property_type?: string;
    bedrooms: number;
    bathrooms: number;
  };
  property_type?: string;
  has_garden?: boolean;
  has_parking?: boolean;
  created_at?: string;
  seller_id?: string;
}

interface PropertyListProps {
  properties: (PropertySummary | TestProperty)[];
  onFilterChange?: (filters: FilterState) => void;
  onSortChange?: (sortOption: SortOption) => void;
  initialFilters?: Partial<FilterState>;
  initialSort?: SortOption;
  showFilters?: boolean;
  showSort?: boolean;
  isLoading?: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onFilterChange,
  onSortChange,
  initialFilters,
  initialSort = 'price_low_to_high',
  showFilters = true,
  showSort = true,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<SortOption>(initialSort);
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSortOption(newSort);
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Convert test properties to format compatible with PropertyCard
  const adaptPropertyForCard = (property: PropertySummary | TestProperty) => {
    // Add missing fields required by PropertySummary
    const adaptedProperty: any = {
      ...property,
      // Default values for required fields in PropertySummary if they don't exist
      owner_id: (property as PropertySummary).owner_id || 1,
      created_at: property.created_at || new Date().toISOString()
    };
    
    return adaptedProperty;
  };

  return (
    <div className="property-list-container">
      <div className="property-list-header">
        {showFilters && (
          <div className="property-filters">
            <h2>Filter Properties</h2>
            <PropertyFilter 
              onFilterChange={handleFilterChange} 
              initialFilters={initialFilters}
            />
          </div>
        )}
        
        {showSort && (
          <div className="property-sort">
            <h2>Sort Properties</h2>
            <select
              value={sortOption}
              onChange={handleSortChange}
              aria-label="Sort properties"
            >
              <option value="price_low_to_high">Price: Low to High</option>
              <option value="price_high_to_low">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-indicator">Loading properties...</div>
      ) : properties.length > 0 ? (
        <div className="property-grid">
          {properties.map(property => (
            <PropertyCard 
              key={property.id}
              {...adaptPropertyForCard(property)}
              showSaveButton={false}
            />
          ))}
        </div>
      ) : (
        <div className="no-properties-message">
          No properties match your criteria. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default PropertyList; 