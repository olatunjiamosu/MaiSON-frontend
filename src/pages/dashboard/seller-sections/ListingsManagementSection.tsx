import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpRight 
} from 'lucide-react';

interface Property {
  id: string;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
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
  viewings: number;
  favorites: number;
  inquiries: number;
  dateAdded: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    status: 'active',
    image: '/api/placeholder/320/200',
    price: '£800,000',
    road: '123 Park Avenue',
    city: 'London',
    postcode: 'SE22 9QA',
    beds: 2,
    baths: 2,
    reception: 1,
    sqft: 1200,
    propertyType: 'Terraced',
    epcRating: 'C',
    viewings: 12,
    favorites: 8,
    inquiries: 3,
    dateAdded: '2023-05-15',
  },
  // Add more mock properties...
];

const ListingsManagementSection = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
          <p className="text-gray-500">Manage your property listings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Properties</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {/* Property Image */}
            <div className="relative">
              <img
                src={property.image}
                alt={property.road}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${property.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    property.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'}`}
                >
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{property.price}</h3>
                  <p className="text-gray-600">{property.road}</p>
                  <p className="text-gray-500 text-sm">{property.city}, {property.postcode}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Property Specs */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>{property.beds} beds</span>
                <span>{property.baths} baths</span>
                <span>{property.sqft} sq ft</span>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span>{property.viewings} viewings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{property.inquiries} inquiries</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100">
                  Edit Details
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800 border rounded">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
                <button className="px-3 py-2 text-red-600 hover:text-red-700 border rounded">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsManagementSection; 