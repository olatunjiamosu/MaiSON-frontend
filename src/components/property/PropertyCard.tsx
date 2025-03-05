import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../lib/formatters';
import { PropertySummary } from '../../types/property';
import PropertyService from '../../services/PropertyService';

// Only add UI-specific props to the API type
export interface PropertyCardProps extends PropertySummary {
  className?: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showSaveButton?: boolean;
}

const PropertyCard = ({
  id,
  main_image_url,
  price,
  address,
  bedrooms,
  bathrooms,
  specs,
  className = '',
  isSaved = false,
  onToggleSave,
  showSaveButton = true,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const formattedPrice = formatPrice(price);
  const [saving, setSaving] = useState(false);
  // Add local saved state to handle immediate UI updates
  const [localSaved, setLocalSaved] = useState(isSaved);

  // Update localSaved when isSaved prop changes
  React.useEffect(() => {
    setLocalSaved(isSaved);
  }, [isSaved]);

  const handleViewProperty = () => {
    navigate(`/property/${id}`, {
      state: { from: localSaved ? 'saved' : 'listings' },
    });
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Immediately update UI state for better UX
    setLocalSaved(prev => !prev);
    setSaving(true);
    
    try {
      if (localSaved) {
        // If already saved, unsave it
        if (onToggleSave) {
          await onToggleSave(id);
          toast.success('Property removed from saved list');
        } else {
          await PropertyService.unsaveProperty(id);
          toast.success('Property removed from saved list');
        }
      } else {
        // If not saved, save it
        if (onToggleSave) {
          await onToggleSave(id);
          toast.success('Property added to saved list');
        } else {
          await PropertyService.saveProperty(id);
          toast.success('Property added to saved list');
        }
      }
    } catch (error) {
      // Revert UI state on error
      setLocalSaved(prev => !prev);
      console.error('Error toggling property save status:', error);
      toast.error(localSaved 
        ? 'Failed to remove property from saved list' 
        : 'Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleViewing = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Scheduling viewing for property:', id);
    toast.success('Opening scheduling modal...', {
      duration: 3000,
      position: 'bottom-right',
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${className}`}
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          src={main_image_url || '/placeholder-property.jpg'}
          alt={`${address.street}, ${address.city}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-property.jpg';
          }}
          loading="lazy"
        />
        {showSaveButton && (
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={localSaved ? "Unsave property" : "Save property"}
          >
            <Heart
              className={`h-5 w-5 ${
                localSaved ? 'fill-emerald-600 text-emerald-600' : 'text-gray-400'
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-1 mb-3">
          <h3 className="text-xl font-bold text-gray-900">{formattedPrice}</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{address.street}</p>
            <p>
              {address.city}, {address.postcode}
            </p>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 mb-3 text-gray-600">
          <span>{bedrooms} Bed</span>
          <span>{bathrooms} Bath</span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>{specs.square_footage.toLocaleString()} sq ft</span>
          <span>{specs.property_type}</span>
        </div>

        {/* View Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleViewProperty}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            View Property
          </button>
          <button
            onClick={handleScheduleViewing}
            className="w-full border border-emerald-600 text-emerald-600 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Schedule Viewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
