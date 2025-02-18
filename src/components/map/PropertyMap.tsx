import React from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

interface Property {
  id: string;
  lat: number;
  lng: number;
  price: string;
  image: string;
  beds: number;
  propertyType: string;
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: string;
  onPropertySelect: (propertyId: string) => void;
}

const PropertyMap = ({
  properties,
  selectedProperty,
  onPropertySelect,
}: PropertyMapProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selectedMarker, setSelectedMarker] = React.useState<Property | null>(null);

  const mapCenter = {
    lat: 51.5074, // London center
    lng: -0.1278,
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      zoom={10}
      center={mapCenter}
      mapContainerClassName="w-full h-full"
    >
      {properties.map(property => (
        <Marker
          key={property.id}
          position={{ lat: property.lat, lng: property.lng }}
          onClick={() => {
            setSelectedMarker(property);
            onPropertySelect(property.id);
          }}
          icon={{
            url:
              selectedProperty === property.id
                ? '/path-to-selected-marker.svg'
                : '/path-to-marker.svg',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          // Use AdvancedMarkerElement
          options={{
            // Add any additional options here
          }}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <img
              src={selectedMarker.image}
              alt="Property"
              className="w-48 h-32 object-cover rounded mb-2"
            />
            <div className="font-semibold">{selectedMarker.price}</div>
            <div className="text-sm text-gray-600">
              {selectedMarker.beds} bed {selectedMarker.propertyType}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default PropertyMap;