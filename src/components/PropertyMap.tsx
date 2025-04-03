import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ latitude, longitude, address }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <GoogleMap
        zoom={15}
        center={{ lat: latitude, lng: longitude }}
        mapContainerClassName="w-full h-[300px]"
        options={{
          scrollwheel: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={{ lat: latitude, lng: longitude }}
          icon={{
            url: '/path-to-marker.svg',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
      </GoogleMap>
    </div>
  );
};

export default PropertyMap; 