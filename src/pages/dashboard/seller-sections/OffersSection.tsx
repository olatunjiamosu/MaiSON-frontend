import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  BarChart,
  Clock,
  Info,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface SellerNegotiation {
  buyer_id: string;
  buyer_name: string;
  created_at: string;
  current_offer: number;
  last_offer_by: string;
  last_updated: string;
  negotiation_id: string;
  property_id: string;
  status: 'active' | 'cancelled' | 'accepted' | 'rejected';
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
  address?: {
    street: string;
    city: string;
    postcode: string;
  };
}

const mockStats: PropertyStats = {
  askingPrice: 500000,
  averageOffer: 480000,
  highestOffer: 485000,
  numberOfOffers: 2,
  averageLocalPrice: 492000,
  recentSoldPrice: 488000
};

const OffersSection: React.FC<{ property?: PropertyDetailWithStatus }> = ({ property }) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'accepted' | 'rejected' | 'pending' | 'action_required'>('all');
  const [negotiations, setNegotiations] = useState<SellerNegotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [displayOfferAmount, setDisplayOfferAmount] = useState('');
  const [offerError, setOfferError] = useState<string | null>(null);
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectOfferId, setRejectOfferId] = useState<string | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [acceptOfferId, setAcceptOfferId] = useState<string | null>(null);

  // Calculate market stats from real data
  const marketStats = React.useMemo(() => {
    const askingPrice = property?.price || 0;
    const offers = negotiations.map(n => n.current_offer);
    const highestOffer = offers.length > 0 ? Math.max(...offers) : 0;
    const numberOfOffers = negotiations.length;

    return {
      askingPrice,
      highestOffer,
      numberOfOffers
    };
  }, [property?.price, negotiations]);

  useEffect(() => {
    const fetchNegotiations = async () => {
      if (!property?.id || !user?.uid) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/dashboard`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch negotiations');
        }

        const data = await response.json();
        setNegotiations(data.negotiations_as_seller || []);
      } catch (err) {
        console.error('Error fetching negotiations:', err);
        setError('Failed to load offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNegotiations();
  }, [property?.id, user?.uid]);

  const getOfferStrength = (amount: number): { strength: string; color: string } => {
    const percentageOfAsking = (amount / marketStats.askingPrice) * 100;
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

  const getDisplayStatus = (negotiation: SellerNegotiation): 'accepted' | 'rejected' | 'pending' | 'action_required' => {
    if (negotiation.status === 'accepted') return 'accepted';
    if (negotiation.status === 'rejected') return 'rejected';
    if (negotiation.status === 'active') {
      return negotiation.last_offer_by === user?.uid ? 'pending' : 'action_required';
    }
    return 'action_required';
  };

  const filteredNegotiations = selectedFilter === 'all'
    ? negotiations
    : negotiations.filter(neg => getDisplayStatus(neg) === selectedFilter);

  const handleCounterOffer = (negotiation: SellerNegotiation) => {
    setCounterOfferId(negotiation.negotiation_id);
    const amount = negotiation.current_offer.toString();
    setOfferAmount(amount);
    setDisplayOfferAmount(amount.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    setIsOfferModalOpen(true);
  };

  const handleSubmitCounterOffer = async () => {
    if (!user?.uid || !counterOfferId) return;
    
    try {
      setOfferError(null);

      const numericAmount = parseFloat(offerAmount.replace(/,/g, ''));
      if (!offerAmount || isNaN(numericAmount)) {
        setOfferError('Please enter a valid offer amount');
        return;
      }

      const negotiation = negotiations.find(n => n.negotiation_id === counterOfferId);
      if (!negotiation) {
        setOfferError('Negotiation not found');
        return;
      }

      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            property_id: negotiation.property_id,
            offer_amount: Math.round(numericAmount),
            negotiation_id: negotiation.negotiation_id
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit counter offer');
      }

      // Update the negotiation in the UI
      setNegotiations(prevNegotiations => 
        prevNegotiations.map(n => 
          n.negotiation_id === counterOfferId
            ? {
                ...n,
                current_offer: Math.round(numericAmount),
                last_offer_by: user.uid,
                last_updated: new Date().toISOString()
              }
            : n
        )
      );

      // Reset and close modal
      setOfferAmount('');
      setDisplayOfferAmount('');
      setOfferError(null);
      setIsOfferModalOpen(false);
      setCounterOfferId(null);

    } catch (err) {
      console.error('Error submitting counter offer:', err);
      setOfferError(err instanceof Error ? err.message : 'Failed to submit counter offer');
    }
  };

  const handleRejectOffer = (negotiation: SellerNegotiation) => {
    setRejectOfferId(negotiation.negotiation_id);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!user?.uid || !rejectOfferId) return;
    
    try {
      const negotiation = negotiations.find(n => n.negotiation_id === rejectOfferId);
      if (!negotiation) return;

      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers/${rejectOfferId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reject'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject offer');
      }

      // Update the negotiation in the UI
      setNegotiations(prevNegotiations => 
        prevNegotiations.map(n => 
          n.negotiation_id === rejectOfferId
            ? {
                ...n,
                status: 'rejected',
                last_updated: new Date().toISOString()
              }
            : n
        )
      );

      // Close modal
      setIsRejectModalOpen(false);
      setRejectOfferId(null);

    } catch (err) {
      console.error('Error rejecting offer:', err);
    }
  };

  const handleAcceptOffer = (negotiation: SellerNegotiation) => {
    setAcceptOfferId(negotiation.negotiation_id);
    setIsAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!user?.uid || !acceptOfferId) return;
    
    try {
      const negotiation = negotiations.find(n => n.negotiation_id === acceptOfferId);
      if (!negotiation) return;

      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers/${acceptOfferId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'accept'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to accept offer');
      }

      // Update the negotiation in the UI
      setNegotiations(prevNegotiations => 
        prevNegotiations.map(n => 
          n.negotiation_id === acceptOfferId
            ? {
                ...n,
                status: 'accepted',
                last_updated: new Date().toISOString()
              }
            : n
        )
      );

      // Close modal
      setIsAcceptModalOpen(false);
      setAcceptOfferId(null);

    } catch (err) {
      console.error('Error accepting offer:', err);
    }
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
                <h3 className="text-2xl font-bold text-gray-900">
                  {marketStats.askingPrice ? formatPrice(marketStats.askingPrice) : '-'}
                </h3>
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
                <h3 className="text-2xl font-bold text-gray-900">
                  {marketStats.highestOffer ? formatPrice(marketStats.highestOffer) : '-'}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {marketStats.highestOffer > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {((marketStats.highestOffer / marketStats.askingPrice) * 100).toFixed(1)}% of asking price
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Local Average</p>
                <h3 className="text-2xl font-bold text-gray-900">-</h3>
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
                <h3 className="text-2xl font-bold text-gray-900">{marketStats.numberOfOffers || '-'}</h3>
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
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Current Offers</h3>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Offers</option>
              <option value="action_required">Action Required</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading offers...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : filteredNegotiations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No {selectedFilter === 'all' ? '' : selectedFilter} offers found
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredNegotiations.map((negotiation) => {
              const offerStrength = getOfferStrength(negotiation.current_offer);
              
              return (
                <div key={negotiation.negotiation_id} className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Header with Buyer Name and Status */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Offer from: {negotiation.buyer_name}
                          </h3>
                        </div>
                        <div>
                          {negotiation.status === 'accepted' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Accepted
                            </span>
                          )}
                          {negotiation.status === 'active' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
                              {negotiation.last_offer_by === user?.uid ? (
                                <Clock className="w-4 h-4 mr-1" />
                              ) : (
                                <AlertCircle className="w-4 h-4 mr-1" />
                              )}
                              {negotiation.last_offer_by === user?.uid ? 'Pending' : 'Action Required'}
                            </span>
                          )}
                          {negotiation.status === 'rejected' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700">
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price Information and Action Buttons */}
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-6">
                          <div>
                            <span className={`text-sm ${
                              negotiation.status === 'active' && negotiation.last_offer_by === user?.uid ? 'text-blue-600' :
                              negotiation.status === 'active' ? 'text-emerald-600' : 
                              negotiation.status === 'rejected' ? 'text-red-600' :
                              negotiation.status === 'accepted' ? 'text-emerald-600' :
                              'text-gray-500'
                            }`}>
                              {negotiation.status === 'active' && negotiation.last_offer_by !== user?.uid ? 'Current Offer From Buyer: ' :
                               negotiation.status === 'active' ? 'Counter Offer To Buyer: ' :
                               negotiation.status === 'accepted' ? 'Accepted offer: ' :
                               negotiation.status === 'rejected' ? 'Rejected offer: ' : 'Offer: '}
                            </span>
                            <span className={`text-lg font-medium ${
                              negotiation.status === 'active' && negotiation.last_offer_by === user?.uid ? 'text-blue-600' :
                              negotiation.status === 'active' ? 'text-emerald-600' :
                              negotiation.status === 'accepted' ? 'text-emerald-600' :
                              negotiation.status === 'rejected' ? 'text-red-600' :
                              'text-gray-900'
                            }`}>
                              {formatPrice(negotiation.current_offer)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(negotiation.last_updated).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        {negotiation.status === 'active' && getDisplayStatus(negotiation) === 'action_required' && (
                          <div className="flex items-center gap-2">
                            <button className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors text-sm font-medium" onClick={() => handleAcceptOffer(negotiation)}>
                              Accept
                            </button>
                            <button className="px-4 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium" onClick={() => handleRejectOffer(negotiation)}>
                              Reject
                            </button>
                            <button className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium" onClick={() => handleCounterOffer(negotiation)}>
                              Counter
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* View Details Link */}
                  <div className="flex justify-end border-t border-gray-200">
                    <button className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 text-sm font-medium py-3 px-6">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                Your highest offer is {((marketStats.highestOffer / mockStats.averageLocalPrice) * 100).toFixed(1)}% 
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
                Your asking price is positioned {marketStats.askingPrice > mockStats.averageLocalPrice ? 'above' : 'below'} 
                the local market average, which could {marketStats.askingPrice > mockStats.averageLocalPrice ? 'extend' : 'reduce'} 
                the time to sell.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && createPortal(
        <div className="fixed inset-0 overflow-y-auto z-[9999]">
          <div className="flex min-h-full items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => {
              setIsRejectModalOpen(false);
              setRejectOfferId(null);
            }} />
            <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6 z-[10000]">
              {/* Close button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Reject Offer</h3>
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectOfferId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-gray-700">
                  Are you sure you want to reject this offer? This action cannot be undone.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Yes, Reject Offer
                </button>
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectOfferId(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Offer Modal */}
      {isOfferModalOpen && createPortal(
        <div className="fixed inset-0 overflow-y-auto z-[9999]">
          <div className="flex min-h-full items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => {
              setIsOfferModalOpen(false);
              setCounterOfferId(null);
              setOfferError(null);
            }} />
            <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6 z-[10000]">
              {/* Close button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Counter Offer</h3>
                <button
                  onClick={() => {
                    setIsOfferModalOpen(false);
                    setCounterOfferId(null);
                    setOfferError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {counterOfferId && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-lg text-gray-700 font-medium">
                    {negotiations.find(n => n.negotiation_id === counterOfferId)?.buyer_name}
                  </p>
                  <p className="text-lg font-semibold ml-4 text-gray-900">
                    {negotiations.find(n => n.negotiation_id === counterOfferId)?.last_offer_by !== user?.uid
                      ? 'Counter Offer: '
                      : 'Current offer: '
                    }
                    {formatPrice(negotiations.find(n => n.negotiation_id === counterOfferId)?.current_offer || 0)}
                  </p>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700">
                  Counter Offer Amount (£)
                </label>
                <input
                  type="text"
                  id="offerAmount"
                  value={displayOfferAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    const rawValue = value.replace(/,/g, '');
                    setOfferAmount(rawValue);
                    setDisplayOfferAmount(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                    setOfferError(null);
                  }}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    offerError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your counter offer amount"
                />
                {offerError && (
                  <p className="text-sm text-red-600 mt-1">{offerError}</p>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmitCounterOffer}
                  className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit Counter Offer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Accept Confirmation Modal */}
      {isAcceptModalOpen && createPortal(
        <div className="fixed inset-0 overflow-y-auto z-[9999]">
          <div className="flex min-h-full items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => {
              setIsAcceptModalOpen(false);
              setAcceptOfferId(null);
            }} />
            <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6 z-[10000]">
              {/* Close button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Accept Offer</h3>
                <button
                  onClick={() => {
                    setIsAcceptModalOpen(false);
                    setAcceptOfferId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-gray-700">
                  Are you sure you want to accept this offer? This action cannot be undone.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleConfirmAccept}
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  Yes, Accept Offer
                </button>
                <button
                  onClick={() => {
                    setIsAcceptModalOpen(false);
                    setAcceptOfferId(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OffersSection; 