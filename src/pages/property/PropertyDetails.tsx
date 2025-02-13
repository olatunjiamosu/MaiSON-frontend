import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import SinglePropertyMap from '../../components/map/SinglePropertyMap';

interface PropertyDetailsProps {
  property: {
    id: string;
    images: string[];
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
    description: string;
    floorPlan: string;
    lat: number;
    lng: number;
  };
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if we came from saved properties
    if (location.state?.from === 'saved') {
      navigate('/buyer-dashboard/saved');
    } else {
      navigate(-1);
    }
  };

  const nextImage = () => {
    setSelectedImage(prev =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setSelectedImage(prev =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to{' '}
            {location.state?.from === 'saved' ? 'Saved Properties' : 'Listings'}
          </button>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
              <Heart className="h-5 w-5" />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8 relative">
          {/* Main Image Container */}
          <div
            className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
          >
            <img
              src={property.images[selectedImage]}
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
                {selectedImage + 1} / {property.images.length}
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
          {!isFullscreen && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-w-16 aspect-h-9 transition-all ${
                    selectedImage === index
                      ? 'ring-2 ring-emerald-600 opacity-100'
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

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.price}
              </h1>
              <p className="text-lg text-gray-600">
                {property.road}, {property.city}, {property.postcode}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <p className="text-gray-600">Bedrooms</p>
                <p className="text-lg font-semibold">{property.beds}</p>
              </div>
              <div>
                <p className="text-gray-600">Bathrooms</p>
                <p className="text-lg font-semibold">{property.baths}</p>
              </div>
              <div>
                <p className="text-gray-600">Reception Rooms</p>
                <p className="text-lg font-semibold">{property.reception}</p>
              </div>
              <div>
                <p className="text-gray-600">Floor Area</p>
                <p className="text-lg font-semibold">{property.sqft} sq ft</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                About this property
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Floor Plan */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Floor Plan</h2>
              <img
                src={property.floorPlan}
                alt="Floor Plan"
                className="w-full"
              />
            </div>

            {/* Location */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <SinglePropertyMap
                property={{
                  lat: property.lat,
                  lng: property.lng,
                  address: `${property.road}, ${property.city}, ${property.postcode}`,
                }}
              />
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border sticky top-24">
              <button className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                Request Viewing
              </button>

              {/* Additional Property Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">EPC Rating</span>
                  <span className="font-medium">{property.epcRating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modify the fullscreen section */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close button - moved to top-left for better visibility */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 left-6 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-50"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={property.images[selectedImage]}
              alt="Property"
              className="max-h-screen max-w-screen object-contain"
            />

            {/* Navigation controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-8">
              <button
                onClick={previousImage}
                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors transform hover:scale-110"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors transform hover:scale-110"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>

            {/* Image counter - moved to bottom center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <div className="px-4 py-2 rounded-full bg-black/50 text-white">
                {selectedImage + 1} / {property.images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
