import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

interface SinglePropertyMapProps {
  property: {
    lat: number;
    lng: number;
    address: string;
  };
}

const SinglePropertyMap = ({ property }: SinglePropertyMapProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Use the environment variable
  });

  if (!isLoaded) return <div>Loading map...</div>;

  const handleGetDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`;
    window.open(directionsUrl, '_blank');
  };

  const handleViewInGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/@?api=1&map_action=map&center=${property.lat},${property.lng}&zoom=15`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <GoogleMap
        zoom={15}
        center={{ lat: property.lat, lng: property.lng }}
        mapContainerClassName="w-full h-full"
        options={{
          scrollwheel: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={{ lat: property.lat, lng: property.lng }}
          icon={{
            url: '/path-to-marker.svg',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
      </GoogleMap>

      {/* Location Details */}
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <h3 className="font-semibold text-gray-900">Location</h3>
        <p className="text-gray-600">{property.address}</p>
        <div className="mt-2 flex gap-2">
          <button 
            onClick={handleGetDirections} 
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            Get Directions
          </button>
          <button 
            onClick={handleViewInGoogleMaps} 
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            View in Google Maps
          </button>
        </div>
      </div>
    </div>
  );
};

export default SinglePropertyMap;