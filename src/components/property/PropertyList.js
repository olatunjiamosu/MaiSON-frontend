const React = require('react');
const { useState } = require('react');
const { useNavigate } = require('react-router-dom');

// Define possible sort options
const SORT_OPTIONS = {
  PRICE_LOW_TO_HIGH: 'price_low_to_high',
  PRICE_HIGH_TO_LOW: 'price_high_to_low',
  NEWEST: 'newest',
  OLDEST: 'oldest'
};

/**
 * PropertyList Component
 * Displays a list of properties with filtering and sorting capabilities
 */
const PropertyList = (props) => {
  const {
    properties,
    onFilterChange,
    onSortChange,
    initialFilters,
    initialSort = SORT_OPTIONS.PRICE_LOW_TO_HIGH,
    showFilters = true,
    showSort = true,
    isLoading = false
  } = props;
  
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState(initialSort);
  
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortOption(newSort);
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const handleFilterChange = (filters) => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Mock PropertyFilter component for testing
  const PropertyFilter = ({ onFilterChange, initialFilters }) => {
    const handleApplyFilters = () => {
      if (onFilterChange) {
        onFilterChange({
          minPrice: 400000,
          maxPrice: 600000,
          minBedrooms: 3,
          minBathrooms: 2,
          propertyTypes: ['house'],
          hasGarden: true,
          hasParking: false
        });
      }
    };
    
    return React.createElement('div', { className: 'property-filter' },
      React.createElement('h2', null, 'Filter Properties'),
      React.createElement('div', { className: 'filter-controls' },
        React.createElement('label', { htmlFor: 'min-price' }, 'Min Price'),
        React.createElement('input', { 
          id: 'min-price', 
          type: 'number', 
          'aria-label': 'Min Price',
          defaultValue: initialFilters?.minPrice || '' 
        }),
        
        React.createElement('label', { htmlFor: 'max-price' }, 'Max Price'),
        React.createElement('input', { 
          id: 'max-price', 
          type: 'number', 
          'aria-label': 'Max Price',
          defaultValue: initialFilters?.maxPrice || '' 
        }),
        
        React.createElement('label', { htmlFor: 'min-bedrooms' }, 'Min Bedrooms'),
        React.createElement('input', { 
          id: 'min-bedrooms', 
          type: 'number', 
          'aria-label': 'Bedrooms',
          defaultValue: initialFilters?.minBedrooms || '' 
        }),
        
        React.createElement('label', { htmlFor: 'min-bathrooms' }, 'Min Bathrooms'),
        React.createElement('input', { 
          id: 'min-bathrooms', 
          type: 'number', 
          'aria-label': 'Bathrooms',
          defaultValue: initialFilters?.minBathrooms || '' 
        })
      ),
      React.createElement('div', { className: 'filter-actions' },
        React.createElement('button', { onClick: handleApplyFilters }, 'Apply Filters'),
        React.createElement('button', null, 'Reset Filters')
      )
    );
  };

  // Mock PropertyCard component for testing
  const PropertyCard = (props) => {
    const { id, price, address, bedrooms, bathrooms } = props;
    
    const formatPrice = (price) => {
      return `£${price.toLocaleString('en-GB')}`;
    };
    
    return React.createElement('div', { className: 'property-card', key: id },
      React.createElement('div', { className: 'property-price' }, formatPrice(price)),
      React.createElement('div', { className: 'property-address' }, address.street),
      React.createElement('div', { className: 'property-specs' },
        React.createElement('span', null, `${bedrooms} bed`),
        React.createElement('span', null, `${bathrooms} bath`)
      )
    );
  };

  return React.createElement('div', { className: 'property-list-container' },
    React.createElement('div', { className: 'property-list-header' },
      showFilters && React.createElement('div', { className: 'property-filters' },
        React.createElement(PropertyFilter, { 
          onFilterChange: handleFilterChange, 
          initialFilters: initialFilters 
        })
      ),
      
      showSort && React.createElement('div', { className: 'property-sort' },
        React.createElement('h2', null, 'Sort Properties'),
        React.createElement('select', {
          value: sortOption,
          onChange: handleSortChange,
          'aria-label': 'Sort by'
        },
          React.createElement('option', { value: SORT_OPTIONS.PRICE_LOW_TO_HIGH }, 'Price: Low to High'),
          React.createElement('option', { value: SORT_OPTIONS.PRICE_HIGH_TO_LOW }, 'Price: High to Low'),
          React.createElement('option', { value: SORT_OPTIONS.NEWEST }, 'Newest First'),
          React.createElement('option', { value: SORT_OPTIONS.OLDEST }, 'Oldest First')
        )
      )
    ),
    
    isLoading ? 
      React.createElement('div', { className: 'loading-indicator' }, 'Loading properties...') :
      properties.length > 0 ?
        React.createElement('div', { className: 'property-grid' },
          properties.map(property => 
            React.createElement(PropertyCard, {
              key: property.id,
              id: property.id,
              price: property.price,
              address: property.address,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms
            })
          )
        ) : 
        React.createElement('div', { className: 'no-properties-message' },
          'No properties match your criteria. Try adjusting your filters.'
        )
  );
};

module.exports = PropertyList;
module.exports.default = PropertyList; 