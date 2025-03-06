import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  BarChart,
  Clock,
  Info
} from 'lucide-react';

interface Offer {
  id: string;
  propertyId: string;
  propertyAddress: string;
  buyerName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  submittedAt: string;
  expiresAt: string;
  notes?: string;
  buyerProfile: {
    mortgageApproved: boolean;
    chainLength: number;
    timeframe: string;
  };
}

interface PropertyStats {
  askingPrice: number;
  averageOffer: number;
  highestOffer: number;
  numberOfOffers: number;
  averageLocalPrice: number;
  recentSoldPrice: number;
}

// Add PropertyDetailWithStatus interface to match what SellerDashboard passes
interface PropertyDetailWithStatus {
  id: string;
  price: number;
  status?: 'active' | 'pending' | 'sold' | 'withdrawn';
  // Other property fields can be added as needed
}

const mockOffers: Offer[] = [
  {
    id: '1',
    propertyId: 'prop1',
    propertyAddress: '123 Park Avenue, London',
    buyerName: 'John Smith',
    amount: 485000,
    status: 'pending',
    submittedAt: '2024-02-20T10:00:00',
    expiresAt: '2024-02-23T10:00:00',
    notes: 'First-time buyer, flexible on completion date',
    buyerProfile: {
      mortgageApproved: true,
      chainLength: 0,
      timeframe: '2-3 months'
    }
  },
  {
    id: '2',
    propertyId: 'prop1',
    propertyAddress: '123 Park Avenue, London',
    buyerName: 'Sarah Johnson',
    amount: 475000,
    status: 'pending',
    submittedAt: '2024-02-19T15:30:00',
    expiresAt: '2024-02-22T15:30:00',
    buyerProfile: {
      mortgageApproved: true,
      chainLength: 1,
      timeframe: '3-4 months'
    }
  }
];

// Keep mockStats but we'll only use parts we don't have real data for
const mockStats: PropertyStats = {
  askingPrice: 500000,
  averageOffer: 480000,
  highestOffer: 485000,
  numberOfOffers: 2,
  averageLocalPrice: 492000,
  recentSoldPrice: 488000
};

const OffersSection: React.FC<{ property?: PropertyDetailWithStatus }> = ({ property }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Use property.price if available, otherwise fallback to mock
  const askingPrice = property?.price || mockStats.askingPrice;

  const getOfferStrength = (amount: number): { strength: string; color: string } => {
    const percentageOfAsking = (amount / askingPrice) * 100;
    if (percentageOfAsking >= 98) return { strength: 'Strong', color: 'text-emerald-600' };
    if (percentageOfAsking >= 95) return { strength: 'Good', color: 'text-blue-600' };
    if (percentageOfAsking >= 90) return { strength: 'Fair', color: 'text-yellow-600' };
    return { strength: 'Weak', color: 'text-red-600' };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Offers Portal</h2>
        <p className="text-gray-500">Manage and analyze offers for your properties</p>
      </div>

      {/* Market Overview Cards */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Position</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Asking Price</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPrice(askingPrice)}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Highest Offer</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPrice(mockStats.highestOffer)}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {((mockStats.highestOffer / askingPrice) * 100).toFixed(1)}% of asking price
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Local Average</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPrice(mockStats.averageLocalPrice)}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Based on recent sales in your area
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Number of Offers</p>
                <h3 className="text-2xl font-bold text-gray-900">{mockStats.numberOfOffers}</h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Offers</h3>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Offers</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {mockOffers.map((offer) => {
            const offerStrength = getOfferStrength(offer.amount);
            
            return (
              <div key={offer.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900">{formatPrice(offer.amount)}</h4>
                      <span className={`text-sm ${offerStrength.color}`}>
                        ({offerStrength.strength} offer)
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{offer.propertyAddress}</p>
                    <p className="text-sm text-gray-500">from {offer.buyerName}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {offer.buyerProfile.chainLength === 0 ? 'No chain' : `Chain of ${offer.buyerProfile.chainLength}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{offer.buyerProfile.timeframe}</span>
                    </div>
                    {offer.buyerProfile.mortgageApproved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Mortgage Approved
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg">
                      Accept
                    </button>
                    <button className="w-full sm:w-auto px-4 py-2 border rounded-lg">
                      Counter
                    </button>
                    <button className="w-full sm:w-auto px-4 py-2 border border-red-600 text-red-600 rounded-lg">
                      Reject
                    </button>
                  </div>
                </div>

                {offer.notes && (
                  <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Note: {offer.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Offer Analysis</h4>
              <p className="text-sm text-blue-700">
                Your highest offer is {((mockStats.highestOffer / mockStats.averageLocalPrice) * 100).toFixed(1)}% 
                of the local average price. Recent properties in your area have sold for {formatPrice(mockStats.recentSoldPrice)}.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
            <div className="p-2 bg-emerald-100 rounded-full">
              <BarChart className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-900">Market Position</h4>
              <p className="text-sm text-emerald-700">
                Your asking price is positioned {askingPrice > mockStats.averageLocalPrice ? 'above' : 'below'} 
                the local market average, which could {askingPrice > mockStats.averageLocalPrice ? 'extend' : 'reduce'} 
                the time to sell.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersSection; 