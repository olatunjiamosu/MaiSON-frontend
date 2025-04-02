import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  DollarSign,
  BedDouble,
  Bath,
  Square,
  Building,
  FileText,
  Edit2,
  Save,
  X,
  Settings,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PropertyDetail } from '../../../types/property';

interface MyPropertySectionProps {
  property?: PropertyDetail;
}

type EditingSection = 'basic' | 'features' | 'address' | 'description' | 'additional' | null;

const MyPropertySection: React.FC<MyPropertySectionProps> = ({ property }) => {
  const navigate = useNavigate();
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [editedProperty, setEditedProperty] = useState<PropertyDetail | undefined>(property);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Combine main image and additional images into a single array
  const allImages = property?.main_image_url 
    ? [property.main_image_url, ...(property.image_urls?.filter(url => url !== property.main_image_url) || [])]
    : property?.image_urls || [];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleLogout = async () => {
    try {
      // Clear all chat-related data from localStorage
      localStorage.removeItem('chat_session_id');
      localStorage.removeItem('chat_history');
      localStorage.removeItem('selected_chat');
      
      // Clear all conversation messages
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chat_messages_')) {
          localStorage.removeItem(key);
        }
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleEdit = (section: EditingSection) => {
    setEditingSection(section);
  };

  const handleSave = async (section: EditingSection) => {
    try {
      // TODO: Implement API call to save property details
      setEditingSection(null);
      toast.success('Property details updated successfully');
    } catch (error) {
      console.error('Error saving property details:', error);
      toast.error('Failed to save property details. Please try again.');
    }
  };

  const handleCancel = (section: EditingSection) => {
    setEditedProperty(property);
    setEditingSection(null);
  };

  const handleInputChange = (field: keyof PropertyDetail, value: any) => {
    if (!editedProperty) return;
    setEditedProperty({
      ...editedProperty,
      [field]: value
    });
  };

  if (!property) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-2 text-gray-600">Loading property details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Property</h2>
          <p className="text-gray-500">Manage your property details and settings</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        {/* Main Image Container */}
        <div
          className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
        >
          <img
            src={allImages[selectedImage]}
            alt="Property"
            className={`
              ${
                isFullscreen
                  ? 'h-screen w-screen object-contain'
                  : 'w-full h-[600px] object-cover rounded-lg'
              }
            `}
          />

          {/* Gallery Controls */}
          <div
            className={`absolute inset-0 flex items-center justify-between p-4 ${
              isFullscreen
                ? 'bg-black/50'
                : 'bg-gradient-to-r from-black/20 via-transparent to-black/20'
            }`}
          >
            {/* Previous Button */}
            <button
              onClick={previousImage}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextImage}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Image Counter & Fullscreen Toggle */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <div className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {selectedImage + 1} / {allImages.length}
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Fullscreen Close Button */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Thumbnails - Only show when not in fullscreen */}
        {!isFullscreen && allImages.length > 1 && (
          <div className="grid grid-cols-5 gap-4 mt-4">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-w-16 aspect-h-9 transition-all ${
                  selectedImage === index
                    ? 'ring-2 ring-emerald-600 opacity-100 rounded-lg'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`Property view ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            {editingSection !== 'basic' && (
              <button
                onClick={() => handleEdit('basic')}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              {editingSection === 'basic' ? (
                <select
                  value={editedProperty?.specs?.property_type || ''}
                  onChange={(e) => handleInputChange('specs', { ...property.specs, property_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="flat">Flat</option>
                  <option value="bungalow">Bungalow</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900">
                  {property.specs.property_type.charAt(0).toUpperCase() + property.specs.property_type.slice(1)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              {editingSection === 'basic' ? (
                <input
                  type="number"
                  value={editedProperty?.price || ''}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">£{property.price.toLocaleString()}</p>
              )}
            </div>
            <div className="md:row-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              {editingSection === 'basic' ? (
                <div className="mt-1 space-y-2">
                  <input
                    type="text"
                    value={editedProperty?.address?.house_number || ''}
                    onChange={(e) => handleInputChange('address', { ...property.address, house_number: e.target.value })}
                    placeholder="House Number"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={editedProperty?.address?.street || ''}
                    onChange={(e) => handleInputChange('address', { ...property.address, street: e.target.value })}
                    placeholder="Street"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={editedProperty?.address?.city || ''}
                    onChange={(e) => handleInputChange('address', { ...property.address, city: e.target.value })}
                    placeholder="City"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={editedProperty?.address?.postcode || ''}
                    onChange={(e) => handleInputChange('address', { ...property.address, postcode: e.target.value })}
                    placeholder="Postcode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <p className="mt-1 text-gray-900 whitespace-pre-line">
                  {[
                    `${property.address.house_number} ${property.address.street}`,
                    property.address.city,
                    property.address.postcode
                  ].filter(Boolean).join('\n')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">EPC Rating</label>
              {editingSection === 'basic' ? (
                <select
                  value={editedProperty?.specs?.epc_rating || ''}
                  onChange={(e) => handleInputChange('specs', { ...property.specs, epc_rating: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select EPC Rating</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900">{property.specs.epc_rating || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Square Footage</label>
              {editingSection === 'basic' ? (
                <input
                  type="number"
                  value={editedProperty?.specs?.square_footage || ''}
                  onChange={(e) => handleInputChange('specs', { ...property.specs, square_footage: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.specs.square_footage} sq ft</p>
              )}
            </div>
          </div>

          {/* Room Numbers Row */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              {editingSection === 'basic' ? (
                <input
                  type="number"
                  value={editedProperty?.specs?.bedrooms || ''}
                  onChange={(e) => handleInputChange('specs', { ...property.specs, bedrooms: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.specs.bedrooms}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              {editingSection === 'basic' ? (
                <input
                  type="number"
                  value={editedProperty?.specs?.bathrooms || ''}
                  onChange={(e) => handleInputChange('specs', { ...property.specs, bathrooms: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.specs.bathrooms}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reception Rooms</label>
              {editingSection === 'basic' ? (
                <input
                  type="number"
                  value={editedProperty?.specs?.reception_rooms || ''}
                  onChange={(e) => handleInputChange('specs', { ...property.specs, reception_rooms: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.specs.reception_rooms || 'Not specified'}</p>
              )}
            </div>
          </div>

          {editingSection === 'basic' && (
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => handleCancel('basic')}
                className="bg-white text-red-600 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('basic')}
                className="bg-white text-gray-700 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            {editingSection !== 'description' && (
              <button
                onClick={() => handleEdit('description')}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          {editingSection === 'description' ? (
            <textarea
              value={editedProperty?.details?.description || ''}
              onChange={(e) => handleInputChange('details', { ...property.details, description: e.target.value })}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{property.details?.description || 'No description available'}</p>
          )}
          {editingSection === 'description' && (
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => handleCancel('description')}
                className="bg-white text-red-600 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('description')}
                className="bg-white text-gray-700 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
            {editingSection !== 'additional' && (
              <button
                onClick={() => handleEdit('additional')}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Construction Year</label>
              {editingSection === 'additional' ? (
                <input
                  type="number"
                  value={editedProperty?.details?.construction_year || ''}
                  onChange={(e) => handleInputChange('details', { ...property.details, construction_year: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.details?.construction_year || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parking Spaces</label>
              {editingSection === 'additional' ? (
                <input
                  type="number"
                  value={editedProperty?.details?.parking_spaces || ''}
                  onChange={(e) => handleInputChange('details', { ...property.details, parking_spaces: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.details?.parking_spaces || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Heating Type</label>
              {editingSection === 'additional' ? (
                <select
                  value={editedProperty?.details?.heating_type || ''}
                  onChange={(e) => handleInputChange('details', { ...property.details, heating_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select Heating Type</option>
                  <option value="gas_central">Gas Central Heating</option>
                  <option value="electric">Electric</option>
                  <option value="oil">Oil</option>
                  <option value="heat_pump">Heat Pump</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900">
                  {property.details?.heating_type
                    ? property.details.heating_type
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                    : 'Not specified'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Garden</label>
              {editingSection === 'additional' ? (
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedProperty?.features?.has_garden || false}
                      onChange={(e) => handleInputChange('features', { ...property.features, has_garden: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Has Garden</label>
                  </div>
                  {editedProperty?.features?.has_garden && (
                    <input
                      type="number"
                      value={editedProperty?.features?.garden_size || ''}
                      onChange={(e) => handleInputChange('features', { ...property.features, garden_size: Number(e.target.value) })}
                      placeholder="Garden Size (sq ft)"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  )}
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {property.features?.has_garden 
                    ? `Yes (${property.features.garden_size || 'Size not specified'} sq ft)`
                    : 'No'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Garage</label>
              {editingSection === 'additional' ? (
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={editedProperty?.features?.has_garage || false}
                    onChange={(e) => handleInputChange('features', { ...property.features, has_garage: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Has Garage</label>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">{property.features?.has_garage ? 'Yes' : 'No'}</p>
              )}
            </div>
          </div>
          {editingSection === 'additional' && (
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => handleCancel('additional')}
                className="bg-white text-red-600 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('additional')}
                className="bg-white text-gray-700 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPropertySection; 