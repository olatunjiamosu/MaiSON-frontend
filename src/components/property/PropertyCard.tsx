import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../lib/formatters';
import { PropertySummary } from '../../types/property';

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

  const handleViewProperty = () => {
    navigate(`/property/${id}`, {
      state: { from: isSaved ? 'saved' : 'listings' },
    });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(id);
    } else {
      console.log('Saving property:', id);
      toast.success('Property saved successfully!', {
        duration: 3000,
        position: 'bottom-right',
        icon: '❤️',
      });
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
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
          >
            <Heart
              className={`h-5 w-5 ${
                isSaved ? 'fill-emerald-600 text-emerald-600' : 'text-gray-400'
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
