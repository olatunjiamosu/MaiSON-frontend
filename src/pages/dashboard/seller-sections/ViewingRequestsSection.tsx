import React, { useState } from 'react';
import { Calendar, Clock, Home, Check, X, MoreVertical } from 'lucide-react';

interface ViewingRequest {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  buyerName: string;
  buyerEmail: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
}

const mockViewings: ViewingRequest[] = [
  {
    id: '1',
    propertyId: 'prop1',
    propertyAddress: '123 Park Avenue, London, SE22 9QA',
    propertyImage: '/api/placeholder/320/200',
    buyerName: 'John Smith',
    buyerEmail: 'john.smith@example.com',
    requestedDate: '2024-02-25',
    requestedTime: '14:00',
    status: 'pending',
    notes: 'First-time buyer, very interested in the property',
  },
  {
    id: '2',
    propertyId: 'prop1',
    propertyAddress: '123 Park Avenue, London, SE22 9QA',
    propertyImage: '/api/placeholder/320/200',
    buyerName: 'Sarah Johnson',
    buyerEmail: 'sarah.j@example.com',
    requestedDate: '2024-02-26',
    requestedTime: '11:30',
    status: 'accepted',
    notes: 'Second viewing requested',
  },
  // Add more mock data...
];

const ViewingRequestsSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAccept = (viewingId: string) => {
    console.log('Accepting viewing:', viewingId);
    // TODO: Implement accept logic
  };

  const handleDecline = (viewingId: string) => {
    console.log('Declining viewing:', viewingId);
    // TODO: Implement decline logic
  };

  const filteredViewings = mockViewings.filter(viewing => {
    const matchesSearch = viewing.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viewing.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || viewing.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Viewing Requests</h2>
          <p className="text-gray-500">Manage property viewing requests from potential buyers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by address or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Viewings List */}
      <div className="space-y-4">
        {filteredViewings.map((viewing) => (
          <div 
            key={viewing.id}
            className="bg-white rounded-lg border shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Property Image */}
              <div className="w-full md:w-48 h-48 md:h-auto">
                <img
                  src={viewing.propertyImage}
                  alt={viewing.propertyAddress}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Viewing Details */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${viewing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          viewing.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'}`}
                      >
                        {viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{viewing.propertyAddress}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(viewing.requestedDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {viewing.requestedTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Buyer Details</h4>
                  <p className="text-sm text-gray-600">{viewing.buyerName}</p>
                  <p className="text-sm text-gray-500">{viewing.buyerEmail}</p>
                  {viewing.notes && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      Note: {viewing.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {viewing.status === 'pending' && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(viewing.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(viewing.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredViewings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No viewing requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewingRequestsSection; 