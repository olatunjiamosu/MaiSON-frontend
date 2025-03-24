import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Log component mount/remount for debugging
  useEffect(() => {
    console.log('PropertyMap mounted/remounted with', properties.length, 'properties');
    
    // Initialize a single InfoWindow to reuse
    if (!infoWindowRef.current && typeof google !== 'undefined') {
      infoWindowRef.current = new google.maps.InfoWindow();
    }
    
    // Clean up function will run when component unmounts
    return () => {
      console.log('PropertyMap unmounting, cleaning up markers');
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
      
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  // Calculate map center based on properties
  const getMapCenter = () => {
    if (properties.length === 0) {
      return { lat: 51.5074, lng: -0.1278 }; // Default: London
    }
    
    // If just one property, center on it
    if (properties.length === 1) {
      return { lat: properties[0].lat, lng: properties[0].lng };
    }
    
    // Otherwise calculate the center of all properties
    try {
      const bounds = new google.maps.LatLngBounds();
      properties.forEach(property => {
        bounds.extend({ lat: property.lat, lng: property.lng });
      });
      return { 
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng()
      };
    } catch (error) {
      console.error('Error calculating map center:', error);
      return { lat: 51.5074, lng: -0.1278 }; // Fallback to London
    }
  };

  // Create info window content for a property
  const createInfoWindowContent = (property: Property) => {
    const content = document.createElement('div');
    content.className = 'property-info-window';
    content.style.width = '220px';
    content.style.cursor = 'pointer';
    
    // Set up click handler for the entire info window
    content.onclick = () => window.location.href = `/property/${property.id}`;
    
    // Create and append image
    const img = document.createElement('img');
    img.src = property.image;
    img.alt = 'Property';
    img.style.width = '100%';
    img.style.height = '140px';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    img.style.borderRadius = '4px';
    img.onerror = () => { img.src = '/placeholder-property.jpg'; };
    content.appendChild(img);
    
    // Create and append price
    const price = document.createElement('h2');
    price.textContent = property.price;
    price.style.margin = '8px 0 4px';
    price.style.fontSize = '18px';
    price.style.fontWeight = 'bold';
    content.appendChild(price);
    
    // Create and append address if available
    if (property.address) {
      const address = document.createElement('p');
      address.style.margin = '0 0 4px';
      address.style.fontSize = '14px';
      address.style.color = '#666';
      
      const addressStr = [];
      if (property.address.street) addressStr.push(property.address.street);
      if (property.address.postcode) addressStr.push(property.address.postcode);
      
      address.textContent = addressStr.join(', ');
      content.appendChild(address);
    }
    
    // Create and append property details
    const details = document.createElement('p');
    details.textContent = `${property.beds} bed ${property.propertyType}`;
    details.style.margin = '0';
    details.style.fontSize = '14px';
    details.style.color = '#666';
    content.appendChild(details);
    
    return content;
  };

  // Handle map load
  const handleMapLoad = (map: google.maps.Map) => {
    console.log("Map loaded with", properties.length, "properties");
    mapRef.current = map;
    
    // Create markers immediately after map is loaded
    createMarkers();
    
    // Fit map bounds to show all properties
    if (properties.length > 1 && map) {
      try {
        const bounds = new google.maps.LatLngBounds();
        properties.forEach(property => {
          bounds.extend({ lat: property.lat, lng: property.lng });
        });
        map.fitBounds(bounds);
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
    
    // Close info window when clicking on the map
    map.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        setSelected(null);
        onPropertySelect('');
      }
    });
  };
  
  // Create markers function (separated for clarity)
  const createMarkers = () => {
    // Don't proceed if map isn't loaded yet
    if (!mapRef.current) return;
    
    // Remove existing markers first
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
    
    if (properties.length === 0) {
      console.log('No properties to show markers for');
      return;
    }
    
    console.log('Creating', properties.length, 'markers on the map');
    
    // Create new markers
    const newMarkers = properties.map(property => {
      const marker = new google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: mapRef.current,
        title: property.price // Show price on hover
      });
      
      // Add click listener to show info window
      marker.addListener("click", () => {
        console.log('Marker clicked:', property.id);
        
        // Create and open info window for this property
        if (infoWindowRef.current) {
          infoWindowRef.current.close(); // Close any open info window first
          infoWindowRef.current.setContent(createInfoWindowContent(property));
          infoWindowRef.current.open(mapRef.current, marker);
          
          setSelected(property);
          onPropertySelect(property.id);
        }
      });
      
      return marker;
    });
    
    // Store markers in ref for later cleanup
    markersRef.current = newMarkers;
  };

  // Effect to handle property changes after initial load
  useEffect(() => {
    if (mapRef.current) {
      console.log('Properties changed, recreating markers');
      createMarkers();
      
      // Update bounds when properties change
      if (properties.length > 1) {
        try {
          const bounds = new google.maps.LatLngBounds();
          properties.forEach(property => {
            bounds.extend({ lat: property.lat, lng: property.lng });
          });
          mapRef.current.fitBounds(bounds);
        } catch (error) {
          console.error('Error updating bounds:', error);
        }
      }
    }
  }, [properties]);

  // Effect to handle selecting a property from external source
  useEffect(() => {
    if (selectedProperty && properties.length > 0) {
      const property = properties.find(p => p.id === selectedProperty);
      
      if (property && mapRef.current && infoWindowRef.current) {
        setSelected(property);
        
        // Find the marker for this property
        const marker = markersRef.current.find(m => 
          m.getPosition()?.lat() === property.lat && 
          m.getPosition()?.lng() === property.lng
        );
        
        if (marker) {
          infoWindowRef.current.setContent(createInfoWindowContent(property));
          infoWindowRef.current.open(mapRef.current, marker);
        }
      }
    } else if (!selectedProperty && infoWindowRef.current) {
      // Close info window if no property is selected
      infoWindowRef.current.close();
      setSelected(null);
    }
  }, [selectedProperty, properties]);

  if (loadError) return <div>Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={getMapCenter()}
        zoom={properties.length === 1 ? 14 : 10}
        onLoad={handleMapLoad}
      />
    </div>
  );
};

export default PropertyMap;