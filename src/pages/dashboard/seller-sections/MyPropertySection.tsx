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
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PropertyDetail } from '../../../types/property';

interface MyPropertySectionProps {
  property?: PropertyDetail;
}

const MyPropertySection: React.FC<MyPropertySectionProps> = ({ property }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<PropertyDetail | undefined>(property);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save property details
      setIsEditing(false);
      toast.success('Property details updated successfully');
    } catch (error) {
      console.error('Error saving property details:', error);
      toast.error('Failed to save property details. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedProperty(property);
    setIsEditing(false);
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

      {/* Main Property Image */}
      <div className="relative h-[400px] rounded-lg overflow-hidden">
        <img
          src={property.main_image_url || '/placeholder-property.jpg'}
          alt={property.address.street}
          className="w-full h-full object-cover"
        />
        {isEditing && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              {isEditing ? (
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
                <p className="mt-1 text-gray-900">{property.specs.property_type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              {isEditing ? (
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
          </div>
        </div>

        {/* Property Features */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Property Features</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              {isEditing ? (
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
              {isEditing ? (
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
              <label className="block text-sm font-medium text-gray-700">Square Footage</label>
              {isEditing ? (
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
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Address</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProperty?.address?.street || ''}
                  onChange={(e) => handleInputChange('address', { ...property.address, street: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.address.street}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProperty?.address?.city || ''}
                  onChange={(e) => handleInputChange('address', { ...property.address, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.address.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProperty?.address?.postcode || ''}
                  onChange={(e) => handleInputChange('address', { ...property.address, postcode: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{property.address.postcode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg border shadow-sm md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              value={editedProperty?.details?.description || ''}
              onChange={(e) => handleInputChange('details', { ...property.details, description: e.target.value })}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{property.details?.description || 'No description available'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPropertySection; 