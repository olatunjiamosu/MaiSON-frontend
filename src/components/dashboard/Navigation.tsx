import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Navigation: React.FC = () => {
  const router = useRouter();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    // Fetch property data
    // This is a placeholder and should be replaced with actual data fetching logic
    setProperty({
      main_image_url: '/placeholder-property.jpg',
      address: {
        street: '123 Main St',
        city: 'New York'
      }
    });
  }, []);

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors" onClick={() => navigate('/dashboard')}>
      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
        <img
          src={property?.main_image_url || '/placeholder-property.jpg'}
          alt="Property"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {property?.address?.street || 'No property selected'}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {property?.address?.city || 'Select a property to view details'}
        </p>
      </div>
    </div>
  );
};

export default Navigation; 