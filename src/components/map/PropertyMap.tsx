import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface Property {
  id: string;
  lat: number;
  lng: number;
  price: string;
  image: string;
  beds: number;
  propertyType: string;
  address?: {
    street?: string;
    postcode?: string;
  };
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: string;
  onPropertySelect: (propertyId: string) => void;
}

const PropertyMap = ({ properties, selectedProperty, onPropertySelect }: PropertyMapProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selected, setSelected] = useState<Property | null>(null);

  const center = {
    lat: 51.5074, // London center
    lng: -0.1278,
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={center}
        zoom={10}
      >
        {properties.map(property => (
          <Marker
            key={property.id}
            position={{ lat: property.lat, lng: property.lng }}
            onClick={() => {
              setSelected(property);
              onPropertySelect(property.id);
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
              onPropertySelect('');
            }}
          >
            <div 
              onClick={() => window.location.href = `/property/${selected.id}`}
              style={{ 
                cursor: 'pointer',
                width: '220px',
                overflow: 'hidden'
              }}
            >
              <img 
                src={selected.image} 
                alt="Property"
                style={{ 
                  width: '100%', 
                  height: '140px', 
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-property.jpg';
                }}
              />
              <h2 style={{ 
                margin: '8px 0 4px', 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                {selected.price}
              </h2>
              {selected.address && (
                <p style={{ 
                  margin: '0 0 4px', 
                  fontSize: '14px', 
                  color: '#666' 
                }}>
                  {selected.address.street}
                  {selected.address.street && selected.address.postcode && ', '}
                  {selected.address.postcode}
                </p>
              )}
              <p style={{ 
                margin: '0', 
                fontSize: '14px', 
                color: '#666' 
              }}>
                {selected.beds} bed {selected.propertyType}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;