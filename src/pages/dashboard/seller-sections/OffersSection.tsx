import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  BarChart,
  Clock,
  Info,
  Loader
} from 'lucide-react';
import PricingService from '../../../services/PricingService';
import PropertyService from '../../../services/PropertyService';
import { PricingApiResponse } from '../../../types/pricing';
import { toast } from 'react-hot-toast';

// Local storage keys
const LS_PRICING_DATA_PREFIX = 'maison_pricing_data_';
const LS_PRICING_TIMESTAMP_PREFIX = 'maison_pricing_timestamp_';
// Cache expiry time - 24 hours in milliseconds
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000;

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
  address?: {
    postcode?: string;
    city?: string;
  };
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
  );
};

export default OffersSection; 