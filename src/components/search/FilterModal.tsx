import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters: any;
}

const FilterModal = ({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) => {
  const [filters, setFilters] = useState(currentFilters);

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Filters</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter postcode or area"
                className="w-full p-2 border rounded-lg"
                value={filters.location || ''}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full p-2 border rounded-lg"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  placeholder="2000000"
                  className="w-full p-2 border rounded-lg"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                />
              </div>
            </div>

            {/* Square Footage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Footage
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full p-2 border rounded-lg"
                  value={filters.minSqft || ''}
                  onChange={(e) => setFilters({...filters, minSqft: e.target.value})}
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  placeholder="10000"
                  className="w-full p-2 border rounded-lg"
                  value={filters.maxSqft || ''}
                  onChange={(e) => setFilters({...filters, maxSqft: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={filters.bedrooms || 'Any'}
                  onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                >
                  <option>Any</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={filters.bathrooms || 'Any'}
                  onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
                >
                  <option>Any</option>
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* Reception Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reception Rooms
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={filters.receptionRooms || 'Any'}
                  onChange={(e) => setFilters({...filters, receptionRooms: e.target.value})}
                >
                  <option>Any</option>
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={filters.propertyType || 'Any'}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                >
                  <option>Any</option>
                  <option>Detached</option>
                  <option>Semi-Detached</option>
                  <option>Terraced</option>
                  <option>Flat/Apartment</option>
                  <option>Bungalow</option>
                </select>
              </div>

              {/* Garden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garden
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={filters.garden || 'Any'}
                  onChange={(e) => setFilters({...filters, garden: e.target.value})}
                >
                  <option>Any</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              {/* EPC Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EPC Rating
                </label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={filters.epcRating || 'Any'}
                  onChange={(e) => setFilters({...filters, epcRating: e.target.value})}
                >
                  <option>Any</option>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  onApply(filters);
                  onClose();
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default FilterModal; 