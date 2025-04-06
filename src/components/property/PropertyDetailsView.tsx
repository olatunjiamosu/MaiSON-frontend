import React, { useState, useEffect } from 'react';
import { PropertyDetail } from '../../types/property';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import PropertyMap from '../PropertyMap';
import PropertyService from '../../services/PropertyService';
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Calendar,
  Building2,
  Leaf,
  Settings,
  LogOut,
  RefreshCw,
  Pencil,
  ChevronRight,
  ChevronLeft,
  Eye,
  Check,
  X as XIcon,
  Heart
} from 'lucide-react';

interface PropertyDetailsViewProps {
  property?: PropertyDetail;
  viewMode: 'seller' | 'buyer';
  onMakeOffer?: () => void;
  onScheduleViewing?: () => void;
  onUpdateProperty?: (section: string, updates: Partial<PropertyDetail>) => Promise<void>;
}

interface EditState {
  keyDetails: boolean;
  description: boolean;
  features: boolean;
  price: boolean;
  address: boolean;
}

const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ 
  property, 
  viewMode,
  onMakeOffer,
  onScheduleViewing,
  onUpdateProperty
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [propertyNotes, setPropertyNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    keyDetails: false,
    description: false,
    features: false,
    price: false,
    address: false
  });
  const [editedValues, setEditedValues] = useState<Partial<PropertyDetail>>({});

  useEffect(() => {
    const checkIfPropertyIsSaved = async () => {
      if (!property?.id) return;

      try {
        const dashboardData = await PropertyService.getUserDashboard();
        const isSavedProperty = dashboardData.saved_properties?.some(
          (savedProp: any) => savedProp.property_id === property.id
        );
        setIsSaved(isSavedProperty || false);
        
        // If property is saved, fetch notes
        if (isSavedProperty) {
          const savedProperty = dashboardData.saved_properties?.find(
            (savedProp: any) => savedProp.property_id === property.id
          );
          setPropertyNotes(savedProperty?.notes || '');
        }
      } catch (err) {
        console.error('Error checking if property is saved:', err);
        setIsSaved(false);
      }
    };

    checkIfPropertyIsSaved();
  }, [property?.id]);

  const handleSaveProperty = async () => {
    if (!property?.id) return;

    try {
      setSavingProperty(true);
      if (isSaved) {
        await PropertyService.unsaveProperty(property.id);
        setIsSaved(false);
        toast.success('Property removed from saved properties');
      } else {
        await PropertyService.saveProperty(property.id);
        setIsSaved(true);
        toast.success('Property saved successfully');
      }
    } catch (err) {
      console.error('Error saving/unsaving property:', err);
      toast.error('Failed to save property. Please try again.');
    } finally {
      setSavingProperty(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!property?.id) return;

    try {
      setSavingNotes(true);
      await PropertyService.updateSavedPropertyNotes(property.id, propertyNotes);
      toast.success('Notes saved successfully');
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  if (!property) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Property Selected</h3>
          <p className="text-gray-500 mt-2">Select a property to view its details</p>
        </div>
      </div>
    );
  }

  const handleEdit = (section: keyof EditState) => {
    setEditState(prev => ({ ...prev, [section]: true }));
    setEditedValues({});
  };

  const handleCancel = (section: keyof EditState) => {
    setEditState(prev => ({ ...prev, [section]: false }));
    setEditedValues({});
  };

  const handleApply = async (section: keyof EditState) => {
    if (onUpdateProperty && Object.keys(editedValues).length > 0) {
      try {
        await onUpdateProperty(section, editedValues);
        setEditState(prev => ({ ...prev, [section]: false }));
        setEditedValues({});
        toast.success('Changes saved successfully');
      } catch (error) {
        toast.error('Failed to save changes');
      }
    }
  };

  const handlePreviousImage = () => {
    if (!property.image_urls) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.image_urls!.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!property.image_urls) return;
    setCurrentImageIndex((prev) => 
      prev === property.image_urls!.length - 1 ? 0 : prev + 1
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const renderEditButtons = (section: keyof EditState) => {
    if (viewMode !== 'seller') return null;

    return editState[section] ? (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleCancel(section)}
          className="px-2.5 py-1 text-sm border border-red-300 text-red-400 rounded hover:bg-red-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleApply(section)}
          className="px-2.5 py-1 text-sm border border-emerald-300 text-emerald-400 rounded hover:bg-emerald-50 transition-colors"
        >
          Apply
        </button>
      </div>
    ) : (
      <button
        onClick={() => handleEdit(section)}
        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
      >
        <Pencil className="h-4 w-4" />
        <span>Edit</span>
      </button>
    );
  };

  const updateSpecs = (field: keyof PropertyDetail['specs'], value: string | number) => {
    const currentSpecs = editedValues.specs || { ...property.specs };
    setEditedValues({
      ...editedValues,
      specs: {
        ...currentSpecs,
        [field]: value
      }
    });
  };

  const updateAddress = (field: keyof PropertyDetail['address'], value: string) => {
    const currentAddress = editedValues.address || { ...property.address };
    setEditedValues({
      ...editedValues,
      address: {
        ...currentAddress,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {viewMode === 'seller' ? 'My Property' : 'Property Details'}
          </h2>
          <p className="text-gray-500">
            {viewMode === 'seller' 
              ? 'View and manage property information'
              : 'View property information and make offers'}
          </p>
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

      {/* Main Content */}
      <div className="space-y-6">
        {/* Image Gallery */}
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
          {property.image_urls && property.image_urls.length > 0 ? (
            <>
              <img
                src={property.image_urls[currentImageIndex]}
                alt={`Property view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {viewMode === 'buyer' && (
                <button
                  onClick={handleSaveProperty}
                  disabled={savingProperty}
                  className={`absolute top-4 right-4 p-3 rounded-full ${
                    isSaved 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                      : 'bg-white/80 hover:bg-white text-gray-800'
                  } shadow-sm transition-colors duration-200`}
                >
                  <Heart className={`h-7 w-7 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              )}
              {property.image_urls.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {property.image_urls.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {property.image_urls && property.image_urls.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {property.image_urls.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden ${
                  index === currentImageIndex ? 'ring-2 ring-emerald-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Key Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Details</h3>
                {viewMode === 'seller' && renderEditButtons('keyDetails')}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {editState.keyDetails ? (
                  // Edit mode for key details
                  <>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-gray-600">Bedrooms</label>
                      <input
                        type="number"
                        value={editedValues.specs?.bedrooms ?? property.specs.bedrooms}
                        onChange={(e) => updateSpecs('bedrooms', parseInt(e.target.value))}
                        className="border rounded p-1"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-gray-600">Bathrooms</label>
                      <input
                        type="number"
                        value={editedValues.specs?.bathrooms ?? property.specs.bathrooms}
                        onChange={(e) => updateSpecs('bathrooms', parseInt(e.target.value))}
                        className="border rounded p-1"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-gray-600">Reception Rooms</label>
                      <input
                        type="number"
                        value={editedValues.specs?.reception_rooms ?? property.specs.reception_rooms ?? 0}
                        onChange={(e) => updateSpecs('reception_rooms', parseInt(e.target.value))}
                        className="border rounded p-1"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-gray-600">Square Footage</label>
                      <input
                        type="number"
                        value={editedValues.specs?.square_footage ?? property.specs.square_footage}
                        onChange={(e) => updateSpecs('square_footage', parseInt(e.target.value))}
                        className="border rounded p-1"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-gray-600">Property Type</label>
                      <select
                        value={editedValues.specs?.property_type ?? property.specs.property_type}
                        onChange={(e) => updateSpecs('property_type', e.target.value)}
                        className="w-full border rounded-md p-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="Detached">Detached</option>
                        <option value="Semi-Detached">Semi-Detached</option>
                        <option value="Terraced">Terraced</option>
                        <option value="Bungalow">Bungalow</option>
                        <option value="Flat">Flat</option>
                        <option value="Maisonette">Maisonette</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm text-gray-600">EPC Rating</label>
                      <select
                        value={editedValues.specs?.epc_rating ?? property.specs.epc_rating ?? ''}
                        onChange={(e) => updateSpecs('epc_rating', e.target.value)}
                        className="w-full border rounded-md p-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
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
                    </div>
                  </>
                ) : (
                  // View mode for key details
                  <>
                    <div className="flex items-center space-x-2">
                      <BedDouble className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{property.specs.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{property.specs.bathrooms} Bathrooms</span>
                    </div>
                    {property.specs.reception_rooms && (
                      <div className="flex items-center space-x-2">
                        <Home className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{property.specs.reception_rooms} Reception Rooms</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Square className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{property.specs.square_footage} sq ft</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{property.specs.property_type}</span>
                    </div>
                    {property.specs.epc_rating && (
                      <div className="flex items-center space-x-2">
                        <Leaf className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">EPC {property.specs.epc_rating}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                {viewMode === 'seller' && renderEditButtons('description')}
              </div>
              {editState.description ? (
                <textarea
                  value={editedValues.details?.description ?? property.details?.description ?? ''}
                  onChange={(e) => setEditedValues({
                    ...editedValues,
                    details: { ...editedValues.details, description: e.target.value }
                  })}
                  className="w-full h-32 border rounded p-2"
                />
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {property.details?.description || 'No description available.'}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                {viewMode === 'seller' && renderEditButtons('features')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {property.features && Object.entries(property.features).map(([key, value]) => {
                  if (key === 'has_garden' && value === true) {
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-gray-700">
                          Garden
                          {property.features?.garden_size && ` (${property.features.garden_size} sq ft)`}
                        </span>
                      </div>
                    );
                  }
                  if (key === 'has_garage' && value === true) {
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-gray-700">Garage</span>
                      </div>
                    );
                  }
                  if (key === 'parking_spaces' && typeof value === 'number' && value > 0) {
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-gray-700">
                          {value} {value === 1 ? 'Parking Space' : 'Parking Spaces'}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Map Section */}
            {property.address.latitude && property.address.longitude && (
              <div className="h-[400px] rounded-lg overflow-hidden">
                <PropertyMap 
                  address={`${property.address.street}, ${property.address.city}, ${property.address.postcode}`}
                  latitude={property.address.latitude}
                  longitude={property.address.longitude}
                />
              </div>
            )}
          </div>

          {/* Right Column - Price, Location, and Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-end mb-2">
                {viewMode === 'seller' && renderEditButtons('price')}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500 text-2xl">£</span>
                  {editState.price ? (
                    <input
                      type="number"
                      value={editedValues.price ?? property.price}
                      onChange={(e) => setEditedValues({
                        ...editedValues,
                        price: parseInt(e.target.value)
                      })}
                      className="text-2xl font-bold text-gray-900 border rounded p-1 w-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {property.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {!editState.price && (
                  <span className="text-sm text-gray-500">
                    Listed {new Date(property.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                    {editState.address ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editedValues.address?.house_number ?? property.address.house_number ?? ''}
                          onChange={(e) => updateAddress('house_number', e.target.value)}
                          placeholder="House Number"
                          className="w-full border rounded p-1 mb-1"
                        />
                        <input
                          type="text"
                          value={editedValues.address?.street ?? property.address.street}
                          onChange={(e) => updateAddress('street', e.target.value)}
                          placeholder="Street"
                          className="w-full border rounded p-1 mb-1"
                        />
                        <input
                          type="text"
                          value={editedValues.address?.city ?? property.address.city}
                          onChange={(e) => updateAddress('city', e.target.value)}
                          placeholder="City"
                          className="w-full border rounded p-1 mb-1"
                        />
                        <input
                          type="text"
                          value={editedValues.address?.postcode ?? property.address.postcode}
                          onChange={(e) => updateAddress('postcode', e.target.value)}
                          placeholder="Postcode"
                          className="w-full border rounded p-1"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        {property.address.house_number && property.address.street 
                          ? `${property.address.house_number} ${property.address.street}`
                          : property.address.street}<br />
                        {property.address.city}<br />
                        {property.address.postcode}
                      </p>
                    )}
                  </div>
                </div>
                {viewMode === 'seller' && renderEditButtons('address')}
              </div>
            </div>

            {/* Buyer Actions */}
            {viewMode === 'buyer' && (
              <div className="space-y-4">
                <button
                  onClick={onMakeOffer}
                  className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Make an Offer
                </button>
                <button
                  onClick={onScheduleViewing}
                  className="w-full py-2 px-4 bg-white text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Schedule Viewing
                </button>
                {isSaved && (
                  <div className="bg-white rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="text-sm text-emerald-600 hover:text-emerald-700 disabled:text-gray-400"
                      >
                        {savingNotes ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                    <textarea
                      value={propertyNotes}
                      onChange={(e) => setPropertyNotes(e.target.value)}
                      placeholder="Add your notes about this property..."
                      className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsView;