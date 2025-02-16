import React, { useState } from 'react';
import { Search, Home, Bed, Bath, Square, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Use the same property interface as your ListingsSection
interface Property {
  id: string;
  images: string[];
  price: string;
  address: string;
  postcode: string;
  beds: number;
  baths: number;
  reception: number;
  sqft: number;
  propertyType: string;
}

const PublicListings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Use the same mock data as your ListingsSection
  const properties: Property[] = [
    {
      id: '1',
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
      ],
      price: '£450,000',
      address: '123 Park Avenue',
      postcode: 'SE22 9QA',
      beds: 3,
      baths: 2,
      reception: 1,
      sqft: 1200,
      propertyType: 'Semi-Detached'
    },
    {
      id: '2',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      ],
      price: '£575,000',
      address: '45 Queen Street',
      postcode: 'N1 8QR',
      beds: 4,
      baths: 2,
      reception: 2,
      sqft: 1500,
      propertyType: 'Terraced'
    },
    {
      id: '3',
      images: [
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
      ],
      price: '£725,000',
      address: '789 High Street',
      postcode: 'SW1 1AA',
      beds: 5,
      baths: 3,
      reception: 2,
      sqft: 2000,
      propertyType: 'Detached'
    },
    // Add more properties as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center hover:text-emerald-600"
              >
                <Home className="h-6 w-6 text-emerald-600" />
                <span className="ml-2 text-xl font-semibold">MaiSON</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/sign-up')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by location or postcode"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
            <span>Filters</span>
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={property.images[0]}
                  alt={property.address}
                  className="object-cover rounded-t-lg w-full h-full"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{property.price}</h3>
                    <p className="text-gray-600">{property.address}</p>
                    <p className="text-gray-500 text-sm">{property.postcode}</p>
                  </div>
                  <span className="text-sm text-gray-500">{property.propertyType}</span>
                </div>
                
                <div className="flex gap-4 mt-4 text-gray-600 text-sm">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.baths}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    <span>{property.sqft} sq ft</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="w-full mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicListings; 