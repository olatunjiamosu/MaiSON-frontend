import React from 'react';
import { PropertyDetail } from '../../../types/property';
import { formatPrice } from '../../../utils/format';

interface OffersSectionProps {
  property?: PropertyDetail;
}

const OffersSection: React.FC<OffersSectionProps> = ({ property }) => {
  if (!property) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Offers</h2>
            <p className="text-gray-500">View and manage property offers</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-center text-gray-500">
            <p className="text-lg">No property selected</p>
            <p className="text-sm mt-2">Select a property to view its offers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offers</h2>
          <p className="text-gray-500">View and manage offers for {property.address.street}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p className="text-lg">No offers yet</p>
            <p className="text-sm mt-2">Offers will appear here when they are made</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersSection; 