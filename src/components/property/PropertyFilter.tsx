import React, { useState, useEffect } from 'react';

interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  minBathrooms: number | null;
  propertyTypes: string[];
  hasGarden: boolean | null;
  hasParking: boolean | null;
}

interface PropertyFilterProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({
  onFilterChange,
  initialFilters = {}
}) => {
  const defaultFilters: FilterState = {
    minPrice: null,
    maxPrice: null,
    minBedrooms: null,
    minBathrooms: null,
    propertyTypes: [],
    hasGarden: null,
    hasParking: null
  };

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });

  useEffect(() => {
    // Initialize filters with provided initialFilters
    setFilters(prevFilters => ({
      ...prevFilters,
      ...initialFilters
    }));
  }, [initialFilters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'propertyType') {
        // Handle property type checkboxes
        const propertyType = value;
        setFilters(prevFilters => {
          const propertyTypes = [...prevFilters.propertyTypes];
          
          if (checked) {
            propertyTypes.push(propertyType);
          } else {
            const index = propertyTypes.indexOf(propertyType);
            if (index !== -1) {
              propertyTypes.splice(index, 1);
            }
          }
          
          return {
            ...prevFilters,
            propertyTypes
          };
        });
      } else {
        // Handle boolean checkboxes (garden, parking)
        setFilters(prevFilters => ({
          ...prevFilters,
          [name]: checked
        }));
      }
    } else {
      // Handle numeric inputs
      const numericValue = value === '' ? null : Number(value);
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: numericValue
      }));
    }
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="filter-container">
      <h3>Filter Properties</h3>
      
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="minPrice">Min Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice === null ? '' : filters.minPrice}
              onChange={handleInputChange}
              min="0"
            />
          </div>
          <div className="filter-item">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice === null ? '' : filters.maxPrice}
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Property Details</h4>
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="minBedrooms">Bedrooms</label>
            <input
              type="number"
              id="minBedrooms"
              name="minBedrooms"
              value={filters.minBedrooms === null ? '' : filters.minBedrooms}
              onChange={handleInputChange}
              min="0"
            />
          </div>
          <div className="filter-item">
            <label htmlFor="minBathrooms">Bathrooms</label>
            <input
              type="number"
              id="minBathrooms"
              name="minBathrooms"
              value={filters.minBathrooms === null ? '' : filters.minBathrooms}
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Property Type</h4>
        <div className="filter-row checkbox-group">
          <div className="filter-item">
            <input
              type="checkbox"
              id="house"
              name="propertyType"
              value="house"
              checked={filters.propertyTypes.includes('house')}
              onChange={handleInputChange}
            />
            <label htmlFor="house">House</label>
          </div>
          <div className="filter-item">
            <input
              type="checkbox"
              id="flat"
              name="propertyType"
              value="flat"
              checked={filters.propertyTypes.includes('flat')}
              onChange={handleInputChange}
            />
            <label htmlFor="flat">Flat</label>
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Amenities</h4>
        <div className="filter-row checkbox-group">
          <div className="filter-item">
            <input
              type="checkbox"
              id="garden"
              name="hasGarden"
              checked={filters.hasGarden === true}
              onChange={handleInputChange}
            />
            <label htmlFor="garden">Garden</label>
          </div>
          <div className="filter-item">
            <input
              type="checkbox"
              id="parking"
              name="hasParking"
              checked={filters.hasParking === true}
              onChange={handleInputChange}
            />
            <label htmlFor="parking">Parking</label>
          </div>
        </div>
      </div>
      
      <div className="filter-actions">
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={handleApplyFilters}
        >
          Apply Filters
        </button>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={handleResetFilters}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PropertyFilter; 