import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface PropertyCardProps {
  image: string;
  price: string;
  road: string;
  city: string;
  postcode: string;
  beds: number;
  baths: number;
  reception: number;
  sqft: number;
  propertyType: string;
  epcRating: string;
  className?: string;
  id: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showSaveButton?: boolean;
}

const PropertyCard = ({
  image,
  price,
  road,
  city,
  postcode,
  beds,
  baths,
  reception,
  sqft,
  propertyType,
  epcRating,
  className = '',
  id,
  isSaved = false,
  onToggleSave,
  showSaveButton = true,
}: PropertyCardProps) => {
  const navigate = useNavigate();

  const handleViewProperty = () => {
    navigate(`/property/${id}`, {
      state: { from: isSaved ? 'saved' : 'listings' },
    });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      // We're in the saved properties view, handle unsave
      onToggleSave(id);
    } else {
      // We're in the listings view, handle save
      console.log('Saving property:', id);
      // TODO: Save to backend
      toast.success('Property saved successfully!', {
        duration: 3000,
        position: 'bottom-right',
        icon: '❤️',
      });
      // Don't navigate immediately - let the user stay on listings
      // navigate('/buyer-dashboard/saved');
    }
  };

  const handleScheduleViewing = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement schedule viewing logic
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
          src={image}
          alt="Property"
          className="w-full h-full object-cover"
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
          <h3 className="text-xl font-bold text-gray-900">{price}</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{road}</p>
            <p>
              {city}, {postcode}
            </p>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 mb-3 text-gray-600">
          <span>{beds} Bed</span>
          <span>{baths} Bath</span>
          <span>{reception} Reception</span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>{sqft} sq ft</span>
          <span>{propertyType}</span>
          <span>EPC: {epcRating}</span>
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
            className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Schedule Viewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
