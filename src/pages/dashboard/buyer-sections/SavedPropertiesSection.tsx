import React, { useState } from 'react';
import { Grid, List, Search, PencilLine } from 'lucide-react';
import PropertyCard from '../../../components/property/PropertyCard';
import { toast, Toaster } from 'react-hot-toast';

// Mock data (will be replaced with API call)
const mockSavedProperties = [
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
    savedAt: new Date().toISOString(),
    notes: "Great location, needs renovation",
    collection: 'all',
    tags: ['garden', 'renovation'],
    category: 'all'
  },
  // Add more mock properties...
];

// Add new types
type Category = 'all' | 'must-view' | 'maybe' | 'dream-home';

interface SavedProperty {
  // ... existing property fields
  category: Category;
}

// Separate filter options from actual categories
const filterOptions = [
  { id: 'all', label: 'All Saved Properties' }
];

const categories = [
  { id: 'must-view', label: 'Must View' },
  { id: 'maybe', label: 'Maybe' },
  { id: 'dream-home', label: 'Dream Home' }
];

// Update the dropdown to combine both
const dropdownOptions = [...filterOptions, ...categories];

type ViewMode = 'grid' | 'list';

const SavedPropertiesSection = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleUnsaveProperty = (propertyId: string) => {
    // Will implement with backend
    console.log('Unsaving property:', propertyId);
    
    toast.success(
      (t) => (
        <div className="flex items-center gap-4">
          <span>Property removed from saved</span>
          <button
            onClick={() => {
              console.log('Undoing unsave for:', propertyId);
              toast.dismiss(t.id);
            }}
            className="px-2 py-1 text-sm bg-white text-emerald-600 rounded-lg border border-emerald-600 hover:bg-emerald-50"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000, position: 'bottom-right' }
    );
  };

  const handleCategoryUpdate = (propertyId: string, newCategory: Category) => {
    console.log('Updating category for property:', propertyId, newCategory);
    // TODO: Implement with backend
    toast.success('Category updated!');
    setEditingCategory(null);
  };

  const filteredProperties = mockSavedProperties.filter(property => 
    selectedCategory === 'all' || property.category === selectedCategory &&
    (property.road.toLowerCase().includes(searchTerm.toLowerCase()) ||
     property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
     property.postcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Saved Properties</h2>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
          >
            {dropdownOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Existing search and view controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search saved properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
          </div>
        </div>
      </div>

      {/* Property Grid/List */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
        {filteredProperties.map(property => (
          <div key={property.id} className="relative">
            <div className="space-y-2">
              <PropertyCard 
                {...property}
                isSaved={true}
                onToggleSave={handleUnsaveProperty}
                className={viewMode === 'list' ? 'flex' : ''}
              />
              
              {/* Category Badge & Edit */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${property.category === 'must-view' ? 'bg-emerald-50 text-emerald-600' : 
                    property.category === 'maybe' ? 'bg-yellow-50 text-yellow-600' :
                    property.category === 'dream-home' ? 'bg-blue-50 text-blue-600' : 
                    'bg-gray-50 text-gray-600'}`}
                >
                  {categories.find(c => c.id === property.category)?.label || 'Uncategorized'}
                </span>
                <button
                  onClick={() => setEditingCategory(property.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilLine className="h-4 w-4" />
                </button>
              </div>

              {/* Category Edit Modal */}
              {editingCategory === property.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                    <h3 className="text-lg font-semibold mb-4">Update Category</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryUpdate(property.id, category.id as Category)}
                          className={`w-full p-3 rounded-lg text-left hover:bg-gray-50 ${
                            property.category === category.id ? 'bg-emerald-50 text-emerald-600' : ''
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Date & Notes */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-500">
                    Saved on {new Date(property.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      setEditingNotes(property.id);
                      setNoteText(property.notes || '');
                    }}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                </div>
                
                {editingNotes === property.id ? (
                  <div className="mt-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={3}
                      placeholder="Add notes about this property..."
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // Will implement with backend
                          console.log('Saving note:', noteText);
                          setEditingNotes(null);
                        }}
                        className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  property.notes && (
                    <p className="mt-2 text-sm text-gray-600">{property.notes}</p>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Toaster />
    </div>
  );
};

export default SavedPropertiesSection;