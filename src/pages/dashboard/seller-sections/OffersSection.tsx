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
  Loader,
  ArrowRight,
  AlertCircle,
  X,
  FileText,
  Check,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react';
import PricingService from '../../../services/PricingService';
import PropertyService from '../../../services/PropertyService';
import { PricingApiResponse } from '../../../types/pricing';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Local storage keys
const LS_PRICING_DATA_PREFIX = 'maison_pricing_data_';
const LS_PRICING_TIMESTAMP_PREFIX = 'maison_pricing_timestamp_';
// Cache expiry time - 24 hours in milliseconds
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000;

type ViewMode = 'list' | 'detail';

interface TimelineEvent {
  title: string;
  date: string;
  completed: boolean;
  current?: boolean;
  icon: React.ReactNode;
  info?: string;
}

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
  transaction_history: {
    made_by: string;
    offer_amount: number;
    created_at: string;
  }[];
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

const Timeline = ({ events }: { events: TimelineEvent[] }) => (
  <div className="mt-4 border-t pt-4">
    <h3 className="text-sm font-medium mb-4">Offer History</h3>
    <div className="relative">
      <div className="absolute left-7 top-0 h-full w-px bg-gray-200" />
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex items-start relative">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
              event.completed 
                ? 'bg-emerald-100 text-emerald-600' 
                : event.current 
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
            } z-10`}>
              {event.completed ? <Check className="h-4 w-4" /> : event.icon}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                event.completed 
                  ? 'text-emerald-600' 
                  : event.current 
                    ? 'text-blue-600'
                    : 'text-gray-500'
              }`}>
                {event.title}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">{event.date}</span>
                {event.info && (
                  <span className={`text-xs ml-2 ${event.completed ? 'text-emerald-600' : 'text-gray-500'}`}>• {event.info}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OffersSection: React.FC<{ property?: PropertyDetailWithStatus }> = ({ property }) => {
  const [localAverage, setLocalAverage] = useState<number | null>(null);
  const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
  const [sampleSize, setSampleSize] = useState<number | null>(null);
  const [completePropertyData, setCompletePropertyData] = useState<any | null>(null);
  const [isLoadingPropertyData, setIsLoadingPropertyData] = useState(false);

  // Use property.price if available, otherwise fallback to mock
  const askingPrice = property?.price || mockStats.askingPrice;
  
  // First fetch complete property data to get all details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!property || !property.id) return;
      
      try {
        setIsLoadingPropertyData(true);
        const propertyData = await PropertyService.getPropertyById(property.id);
        setCompletePropertyData(propertyData);
      } catch (error) {
        console.error('Error fetching property details:', error);
        toast.error('Failed to load property details');
      } finally {
        setIsLoadingPropertyData(false);
      }
    };
    
    fetchPropertyDetails();
  }, [property?.id]);
  
  // Once we have property data, fetch pricing data
  useEffect(() => {
    if (isLoadingPropertyData || !completePropertyData) return;
    
    const fetchLocalAveragePrice = async () => {
      try {
        // Get postcode from the complete property data
        const postcode = completePropertyData.address?.postcode;
        
        if (!postcode) {
          console.error('No postcode available in property data');
          return;
        }
        
        console.log(`Fetching pricing data for postcode: ${postcode}`);
        
        // Check localStorage first
        const cacheKey = `${LS_PRICING_DATA_PREFIX}${postcode}`;
        const timestampKey = `${LS_PRICING_TIMESTAMP_PREFIX}${postcode}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(timestampKey);
        
        // Check if we have valid cached data that hasn't expired
        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          
          // If cache is still valid (less than 24 hours old)
          if (now - timestamp < CACHE_EXPIRY_TIME) {
            console.log('Using cached pricing data for', postcode);
            const data = JSON.parse(cachedData) as PricingApiResponse;
            updateLocalAverageFromData(data);
            return;
          }
        }
        
        // Cache expired or doesn't exist, fetch fresh data
        setIsLoadingPriceData(true);
        const data = await PricingService.getPricingData(postcode);
        
        // Cache the result in localStorage
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(timestampKey, Date.now().toString());
        
        updateLocalAverageFromData(data);
      } catch (error) {
        console.error('Error fetching local average price:', error);
        setLocalAverage(null);
        setSampleSize(null);
      } finally {
        setIsLoadingPriceData(false);
      }
    };
    
    fetchLocalAveragePrice();
  }, [completePropertyData, isLoadingPropertyData]);
  
  // Calculate local average price from pricing data
  const updateLocalAverageFromData = (data: PricingApiResponse) => {
    if (!data || !data.price_per_floor_area_per_year || data.price_per_floor_area_per_year.length === 0 || !completePropertyData) {
      console.error('Insufficient data to calculate local average');
      setLocalAverage(null);
      setSampleSize(null);
      return;
    }
    
    try {
      // Get the recommended price info
      const recommendedPrice = PricingService.getRecommendedPrice(data);
      
      if (!recommendedPrice) {
        console.error('No recommended price available');
        setLocalAverage(null);
        setSampleSize(null);
        return;
      }
      
      // Extract property size from complete property data
      // API might provide square_footage in different formats - handle them all
      let propertySizeInSqFt = 0;
      
      if (completePropertyData.specs?.square_footage) {
        propertySizeInSqFt = Number(completePropertyData.specs.square_footage);
      } else if (completePropertyData.square_footage) {
        propertySizeInSqFt = Number(completePropertyData.square_footage);
      } else if (completePropertyData.sqft) {
        propertySizeInSqFt = Number(completePropertyData.sqft);
      }
      
      if (!propertySizeInSqFt || isNaN(propertySizeInSqFt)) {
        console.error('No valid square footage available for the property');
        setLocalAverage(null);
        setSampleSize(null);
        return;
      }
      
      console.log(`Using property size: ${propertySizeInSqFt} sq ft`);
      
      // Convert sq ft to sq m (1 sq ft = 0.092903 sq m)
      const propertySizeInSqM = propertySizeInSqFt * 0.092903;
      console.log(`Property size in sq m: ${propertySizeInSqM.toFixed(2)}`);
      
      // Calculate the average price for this size of property in the area
      const calculatedPrice = recommendedPrice.pricePerSqm * propertySizeInSqM;
      console.log(`Raw calculation: ${recommendedPrice.pricePerSqm} £/sqm × ${propertySizeInSqM.toFixed(2)} sqm = £${calculatedPrice.toFixed(2)}`);
      
      // Round to nearest 1000
      const roundedPrice = Math.round(calculatedPrice / 1000) * 1000;
      console.log(`Rounded local average: £${roundedPrice}`);
      
      setLocalAverage(roundedPrice);
      setSampleSize(recommendedPrice.sampleSize);
    } catch (error) {
      console.error('Error calculating local average:', error);
      setLocalAverage(null);
      setSampleSize(null);
    }
  };
  const { user, logout } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'accepted' | 'rejected' | 'pending' | 'action_required'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedNegotiation, setSelectedNegotiation] = useState<SellerNegotiation | null>(null);
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
        // Filter negotiations to only show those for the current property
        const propertyNegotiations = (data.negotiations_as_seller || []).filter(
          (neg: SellerNegotiation) => neg.property_id === property.id
        );
        setNegotiations(propertyNegotiations);
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

  // Get market position analysis
  const getMarketPositionAnalysis = () => {
    if (!localAverage || isLoadingPriceData || isLoadingPropertyData) {
      return {
        position: 'unknown',
        message: 'Market position information not available'
      };
    }
    
    // Calculate the percentage difference
    const priceDifference = ((askingPrice - localAverage) / localAverage) * 100;
    
    // Determine market position with more nuance
    let position: 'above' | 'below' | 'competitive' = 'competitive';
    let message = '';
    
    if (priceDifference > 5) {
      position = 'above';
      message = `Your asking price is ${Math.abs(priceDifference).toFixed(1)}% above the local market average, which could extend the time to sell but may maximise your return.`;
    } else if (priceDifference < -5) {
      position = 'below';
      message = `Your asking price is ${Math.abs(priceDifference).toFixed(1)}% below the local market average, which could reduce the time to sell but may impact your total return.`;
    } else {
      position = 'competitive';
      message = `Your asking price is competitively positioned (within 5% of local average), which typically attracts good buyer interest while maximising value.`;
    }
    
    return { position, message };
  };
  
  // Get market position data
  const marketPosition = getMarketPositionAnalysis();

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

  const handleViewDetails = (negotiation: SellerNegotiation) => {
    setSelectedNegotiation(negotiation);
    setViewMode('detail');
  };

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  if (viewMode === 'detail' && selectedNegotiation) {
    // Map transaction history to timeline events
    const timelineEvents = selectedNegotiation.transaction_history.map(transaction => ({
      title: transaction.made_by === user?.uid ? 'Your Counter Offer' : 'Buyer Offer',
      date: new Date(transaction.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      completed: true,
      icon: <FileText className="h-3 w-3" />,
      info: `£${transaction.offer_amount.toLocaleString()}`
    }));

    // Add status update if the offer status has changed from active
    if (selectedNegotiation.status !== 'active') {
      timelineEvents.push({
        title: `Offer ${selectedNegotiation.status.charAt(0).toUpperCase() + selectedNegotiation.status.slice(1)}`,
        date: new Date(selectedNegotiation.last_updated).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        completed: true,
        icon: selectedNegotiation.status === 'rejected' ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />,
        info: selectedNegotiation.status === 'rejected' ? 'Offer rejected' : `£${selectedNegotiation.current_offer.toLocaleString()}`
      });
    }

    return (
      <div className="p-6">
        <button 
          onClick={() => setViewMode('list')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to Offers
        </button>
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Offer from: {selectedNegotiation.buyer_name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-600">Listed for: £{property?.price.toLocaleString()}</span>
                <span className={`${
                  selectedNegotiation.status === 'accepted' 
                    ? 'text-emerald-600' 
                    : selectedNegotiation.status === 'rejected'
                      ? 'text-red-600'
                      : selectedNegotiation.last_offer_by === user?.uid 
                        ? 'text-emerald-600' 
                        : 'text-blue-600'
                } font-medium`}>
                  {selectedNegotiation.status === 'accepted' ? (
                    <>Accepted offer: £{selectedNegotiation.current_offer.toLocaleString()}</>
                  ) : selectedNegotiation.status === 'rejected' ? (
                    <>Rejected offer: £{selectedNegotiation.current_offer.toLocaleString()}</>
                  ) : selectedNegotiation.last_offer_by === user?.uid ? (
                    <>Your counter offer: £{selectedNegotiation.current_offer.toLocaleString()}</>
                  ) : (
                    <>Buyer offer: £{selectedNegotiation.current_offer.toLocaleString()}</>
                  )}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              selectedNegotiation.status === 'accepted' 
                ? 'bg-emerald-50 text-emerald-700'
                : selectedNegotiation.status === 'rejected'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
            }`}>
              {selectedNegotiation.status === 'accepted' && <CheckCircle2 className="h-4 w-4" />}
              {selectedNegotiation.status === 'rejected' && <XCircle className="h-4 w-4" />}
              {selectedNegotiation.status === 'active' && (
                selectedNegotiation.last_offer_by === user?.uid ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
              )}
              {selectedNegotiation.status === 'active'
                ? (selectedNegotiation.last_offer_by === user?.uid ? 'Pending' : 'Action Required')
                : selectedNegotiation.status.charAt(0).toUpperCase() + selectedNegotiation.status.slice(1)
              }
            </span>
          </div>
          <Timeline events={timelineEvents} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offers</h2>
          <p className="text-gray-500">Manage and analyze offers for your property</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading offers...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600">{error}</div>
      ) : negotiations.some(n => n.status === 'accepted') ? (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-12 text-center space-y-8">
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-100 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Congratulations!</h2>
              <p className="text-xl text-gray-600">You have accepted an offer on your property</p>
            </div>
            {negotiations.filter(n => n.status === 'accepted').map(acceptedOffer => (
              <div key={acceptedOffer.negotiation_id} className="max-w-2xl mx-auto bg-white rounded-lg border-2 border-emerald-500 p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-xl text-gray-600">Offer accepted from:</p>
                  <p className="text-3xl font-semibold text-gray-900">{acceptedOffer.buyer_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-600">Final agreed price:</p>
                  <p className="text-4xl font-bold text-emerald-600">{formatPrice(acceptedOffer.current_offer)}</p>
                </div>
                <div className="pt-4">
                  <p className="text-base text-gray-500">
                    Accepted on {new Date(acceptedOffer.last_updated).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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
                    {isLoadingPropertyData || isLoadingPriceData ? (
                      <div className="flex items-center gap-2 h-9 mt-1">
                        <Loader className="h-5 w-5 text-emerald-600 animate-spin" />
                        <span className="text-gray-500">Loading data...</span>
                      </div>
                    ) : localAverage ? (
                      <h3 className="text-2xl font-bold text-gray-900">
                        {formatPrice(localAverage)}
                      </h3>
                    ) : (
                      <p className="text-gray-500 mt-1">Not available</p>
                    )}
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                {!isLoadingPropertyData && !isLoadingPriceData && (
                  <p className="mt-2 text-sm text-gray-500">
                    {localAverage ? 
                      `Based on ${sampleSize ? `${sampleSize} ` : ''}similar properties in your area` :
                      'Property data or pricing information not available'}
                  </p>
                )}
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

            {filteredNegotiations.length === 0 ? (
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
                        <button 
                          onClick={() => handleViewDetails(negotiation)}
                          className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 text-sm font-medium py-3 px-6"
                        >
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
                  {marketStats.highestOffer > 0 && localAverage ? (
                    <p className="text-sm text-blue-700">
                      Your highest offer is {((marketStats.highestOffer / localAverage) * 100).toFixed(1)}% 
                      of the local average price.
                    </p>
                  ) : (
                    <p className="text-sm text-blue-700">
                      No offers received yet. When offers are made, you'll see analysis here.
                    </p>
                  )}
                </div>
              </div>
              
              <div className={`flex items-start gap-4 p-4 rounded-lg bg-emerald-50`}>
                <div className={`p-2 rounded-full bg-emerald-100`}>
                  {marketPosition.position === 'above' && <TrendingUp className="h-5 w-5 text-emerald-600" />}
                  {marketPosition.position === 'below' && <TrendingDown className="h-5 w-5 text-emerald-600" />}
                  {marketPosition.position === 'competitive' && <BarChart className="h-5 w-5 text-emerald-600" />}
                  {marketPosition.position === 'unknown' && <Info className="h-5 w-5 text-emerald-600" />}
                </div>
                <div>
                  <h4 className={`font-medium text-emerald-900`}>Market Position</h4>
                  <p className={`text-sm text-emerald-700`}>
                    {marketPosition.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {isOfferModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsOfferModalOpen(false);
            setCounterOfferId(null);
            setOfferError(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full max-w-md relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsOfferModalOpen(false);
                setCounterOfferId(null);
                setOfferError(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Make Counter Offer</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Counter Offer
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                    <input
                      type="text"
                      id="offerAmount"
                      value={displayOfferAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9,]/g, '');
                        setDisplayOfferAmount(value);
                        setOfferAmount(value.replace(/,/g, ''));
                      }}
                      className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  {offerError && (
                    <p className="mt-2 text-sm text-red-600">{offerError}</p>
                  )}
                </div>
                <button
                  onClick={handleSubmitCounterOffer}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm transition-colors"
                >
                  Submit Counter Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Offer Confirmation Modal */}
      {isAcceptModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsAcceptModalOpen(false);
            setAcceptOfferId(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full max-w-md relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsAcceptModalOpen(false);
                setAcceptOfferId(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal content */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">Accept Offer</h3>
                <p className="text-gray-600">
                  Are you sure you want to accept this offer? This action cannot be undone.
                </p>
                {acceptOfferId && (
                  <p className="font-medium text-lg text-emerald-600">
                    {formatPrice(negotiations.find(n => n.negotiation_id === acceptOfferId)?.current_offer || 0)}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsAcceptModalOpen(false);
                    setAcceptOfferId(null);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAccept}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm transition-colors"
                >
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Offer Confirmation Modal */}
      {isRejectModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsRejectModalOpen(false);
            setRejectOfferId(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full max-w-md relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectOfferId(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal content */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">Reject Offer</h3>
                <p className="text-gray-600">
                  Are you sure you want to reject this offer? This action cannot be undone.
                </p>
                {rejectOfferId && (
                  <p className="font-medium text-lg text-red-600">
                    {formatPrice(negotiations.find(n => n.negotiation_id === rejectOfferId)?.current_offer || 0)}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectOfferId(null);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersSection;
