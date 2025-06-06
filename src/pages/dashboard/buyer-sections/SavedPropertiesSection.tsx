import React, { useState, useEffect } from 'react';
import { Search, Grid, List, X } from 'lucide-react';
import PropertyCard from '../../../components/property/PropertyCard';
import { toast } from 'react-hot-toast';
import PropertyService from '../../../services/PropertyService';
import { SavedProperty, DashboardResponse, Negotiation, PropertyDetail } from '../../../types/property';

export default function SavedPropertiesSection() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<Record<string, PropertyDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    // Load view mode from localStorage, default to grid if not found
    const savedViewMode = localStorage.getItem('savedPropertiesViewMode');
    return (savedViewMode === 'list' || savedViewMode === 'grid') ? savedViewMode : 'grid';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('savedPropertiesViewMode', viewMode);
  }, [viewMode]);

  // Get dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardData = await PropertyService.getUserDashboard();
        setSavedProperties(dashboardData.saved_properties || []);
        setNegotiations(dashboardData.negotiations_as_buyer);
        setError(null);
        
        // Fetch full property details for each saved property to get seller_id
        const detailsPromises = dashboardData.saved_properties.map(property => 
          PropertyService.getPropertyById(property.property_id)
            .catch(err => {
              console.error(`Error fetching details for property ${property.property_id}:`, err);
              return null;
            })
        );
        
        const details = await Promise.all(detailsPromises);
        
        // Create a map of property_id to PropertyDetail
        const detailsMap: Record<string, PropertyDetail> = {};
        details.forEach(detail => {
          if (detail) {
            detailsMap[detail.id] = detail;
          }
        });
        
        setPropertyDetails(detailsMap);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Unable to load saved properties. Please try again later.');
        toast.error('Error loading saved properties');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredProperties = savedProperties.filter(
    (property) =>
      property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.postcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnsaveProperty = async (propertyId: string) => {
    try {
      await PropertyService.unsaveProperty(propertyId);
      toast.success('Property removed from saved list');
      // Remove from local state
      setSavedProperties(prev => 
        prev.filter(p => p.property_id !== propertyId)
      );
    } catch (error) {
      console.error('Error removing property from saved list:', error);
      toast.error('Failed to remove property from saved list');
    }
  };

  const handleNotesUpdate = async () => {
    if (!editingNotes) return;
    
    try {
      // Get the new notes
      const newNotes = noteText;
      
      // Update via API
      await PropertyService.updateSavedPropertyNotes(editingNotes, newNotes);
      
      // Update local state
      setSavedProperties(prev =>
        prev.map(p => 
          p.property_id === editingNotes ? { ...p, notes: newNotes } : p
        )
      );
      
      setEditingNotes(null);
      toast.success('Notes updated');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Saved Properties</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            )}
          </div>
          
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <Grid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <List />
            </button>
          </div>
        </div>
      </div>
      
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm 
              ? 'No saved properties match your search.' 
              : 'No saved properties found.'}
          </p>
        </div>
      ) : (
        <div
          className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}
        >
          {filteredProperties.map((property) => {
            // Get the full property details if available
            const details = propertyDetails[property.property_id];
            const seller_id = details?.seller_id;
            
            return (
              <div key={property.property_id} className="relative">
                {viewMode === 'grid' ? (
                  <div className="space-y-2">
                    <PropertyCard
                      id={property.property_id}
                      main_image_url={property.main_image_url}
                      price={property.price}
                      address={property.address}
                      specs={{
                        property_type: property.specs.property_type,
                        square_footage: property.specs.square_footage || 0,
                        bedrooms: property.specs.bedrooms,
                        bathrooms: property.specs.bathrooms
                      }}
                      created_at={property.saved_at}
                      owner_id={0}
                      seller_id={seller_id}
                      isSaved={true}
                      onToggleSave={() => handleUnsaveProperty(property.property_id)}
                      showSaveButton
                      negotiations={negotiations}
                      showChatButton={!!seller_id}
                      fromSection="saved"
                    />
                    
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      {/* Notes section */}
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                          <button
                            onClick={() => {
                              setEditingNotes(property.property_id);
                              setNoteText(property.notes || '');
                            }}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            {property.notes ? 'Edit' : 'Add notes'}
                          </button>
                        </div>
                        
                        {/* Display notes or placeholder */}
                        {editingNotes === property.property_id ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              rows={3}
                              placeholder="Add your notes about this property..."
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleNotesUpdate}
                                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            {property.notes || 'No notes added yet'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <PropertyCard
                      id={property.property_id}
                      main_image_url={property.main_image_url}
                      price={property.price}
                      address={property.address}
                      specs={{
                        property_type: property.specs.property_type,
                        square_footage: property.specs.square_footage || 0,
                        bedrooms: property.specs.bedrooms,
                        bathrooms: property.specs.bathrooms
                      }}
                      created_at={property.saved_at}
                      owner_id={0}
                      seller_id={seller_id}
                      isSaved={true}
                      onToggleSave={() => handleUnsaveProperty(property.property_id)}
                      className="flex"
                      showSaveButton
                      negotiations={negotiations}
                      showChatButton={!!seller_id}
                      fromSection="saved"
                    />
                    
                    <div className="-mt-2 mb-4 p-4 bg-white rounded-b-lg shadow-sm border border-gray-100 border-t-0">
                      {/* Notes section */}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                        <button
                          onClick={() => {
                            setEditingNotes(property.property_id);
                            setNoteText(property.notes || '');
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700"
                        >
                          {property.notes ? 'Edit' : 'Add notes'}
                        </button>
                      </div>
                      
                      {/* Display notes or placeholder */}
                      {editingNotes === property.property_id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            rows={2}
                            placeholder="Add your notes about this property..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleNotesUpdate}
                              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {property.notes || 'No notes added yet'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
