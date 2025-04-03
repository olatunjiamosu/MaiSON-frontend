import React, { useState } from 'react';
import { PropertyDetail } from '../../../types/property';
import { 
  Home, 
  MapPin, 
  BedDouble, 
  Bath, 
  Square, 
  Calendar,
  Building2,
  DollarSign,
  FileText,
  MessageCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Leaf
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PropertyMap from '../../../components/PropertyMap';

interface PropertyDetailsSectionProps {
  property?: PropertyDetail;
}

const PropertyDetailsSection: React.FC<PropertyDetailsSectionProps> = ({ property }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleScheduleViewing = async () => {
    try {
      setIsLoading(true);
      // Navigate to viewings section
      navigate(`/dashboard/buyer/property/${property.id}/viewings`);
      toast.success('Redirecting to viewings section...');
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      toast.error('Failed to schedule viewing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    try {
      setIsLoading(true);
      // Navigate to offers section
      navigate(`/dashboard/buyer/property/${property.id}/offers`);
      toast.success('Redirecting to offers section...');
    } catch (error) {
      console.error('Error making offer:', error);
      toast.error('Failed to make offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{property.address.street}</h2>
          <p className="text-gray-500">{property.address.city}, {property.address.postcode}</p>
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
                    {property.image_urls.map((_, index) => (
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
            {property.image_urls.map((image, index) => (
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
              <div className="grid grid-cols-3 gap-4">
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
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{property.details?.description || 'No description available.'}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {property.features && Object.entries(property.features).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {property.address.latitude && property.address.longitude && (
              <PropertyMap
                latitude={property.address.latitude}
                longitude={property.address.longitude}
                address={`${property.address.street}, ${property.address.city}, ${property.address.postcode}`}
              />
            )}
          </div>

          {/* Right Column - Price and Actions */}
          <div className="space-y-6">
            {/* Price */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500 text-2xl">£</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {property.price.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">Listed {new Date(property.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">
                    {property.address.street}<br />
                    {property.address.city}<br />
                    {property.address.postcode}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleScheduleViewing}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Calendar className="h-5 w-5" />
                )}
                <span>Schedule Viewing</span>
              </button>
              <button
                onClick={handleMakeOffer}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-white text-emerald-600 border border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <DollarSign className="h-5 w-5" />
                )}
                <span>Make Offer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsSection; 