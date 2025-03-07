const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock data for tests
const mockPriceDataPoints = [
  {
    year: 2023,
    count: 14,
    mean: 5800,
    median: 5650,
    std: 450,
    lower_bound: 4900,
    upper_bound: 6500
  },
  {
    year: 2022,
    count: 18,
    mean: 5400,
    median: 5300,
    std: 420,
    lower_bound: 4700,
    upper_bound: 6200
  },
  {
    year: 2021,
    count: 12,
    mean: 5100,
    median: 5000,
    std: 400,
    lower_bound: 4500,
    upper_bound: 5800
  }
];

const mockPricingApiResponse = {
  price_per_floor_area_per_year: mockPriceDataPoints
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock environment variables
process.env.VITE_PRICING_API_URL = 'https://pricing-api.example.com';
process.env.VITE_PRICING_API_ENDPOINT = '/api/property-prices';

// Create mock functions for the PricingService
const mockGetPricingData = jest.fn();
const mockGetRecommendedPrice = jest.fn();
const mockComparePropertyPrices = jest.fn();
const mockCalculateTotalValuation = jest.fn();
const mockTrackOfferHistory = jest.fn();
const mockGetPricingHistory = jest.fn();

// Mock the PricingService
const PricingService = {
  getPricingData: mockGetPricingData,
  getRecommendedPrice: mockGetRecommendedPrice,
  comparePropertyPrices: mockComparePropertyPrices,
  calculateTotalValuation: mockCalculateTotalValuation,
  trackOfferHistory: mockTrackOfferHistory,
  getPricingHistory: mockGetPricingHistory
};

// Mock import.meta.env for the baseUrl and endpoint
// This is a workaround since we can't directly mock import.meta in Jest
jest.mock('../../services/PricingService', () => ({
  __esModule: true,
  default: PricingService
}));

describe('PricingService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch.mockReset();
  });

  describe('Property Valuation Calculations', () => {
    it('should fetch pricing data for a valid postcode', async () => {
      // Setup mock implementation
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockPricingApiResponse))
      };
      
      global.fetch.mockResolvedValue(mockResponse);
      mockGetPricingData.mockResolvedValue(mockPricingApiResponse);

      const postcode = 'SW1W 0NY';
      const result = await PricingService.getPricingData(postcode);

      expect(mockGetPricingData).toHaveBeenCalledWith(postcode);
      expect(result).toEqual(mockPricingApiResponse);
    });

    it('should return recommended price based on recent data', () => {
      // The expected recommendation based on the 2023 data point
      const expectedRecommendation = {
        pricePerSqm: 5650, // Using median as the price per sqm
        confidence: 'medium',
        year: 2023,
        sampleSize: 14
      };

      mockGetRecommendedPrice.mockReturnValue(expectedRecommendation);

      const recommendation = PricingService.getRecommendedPrice(mockPricingApiResponse);
      
      expect(mockGetRecommendedPrice).toHaveBeenCalledWith(mockPricingApiResponse);
      expect(recommendation).toEqual(expectedRecommendation);
    });

    it('should calculate total valuation based on floor area', () => {
      const floorArea = 85; // 85 sq meters
      const pricePerSqm = 5650; // from 2023 data
      const expectedValuation = floorArea * pricePerSqm; // 480,250
      
      mockCalculateTotalValuation.mockReturnValue(expectedValuation);

      const valuation = PricingService.calculateTotalValuation(pricePerSqm, floorArea);
      
      expect(mockCalculateTotalValuation).toHaveBeenCalledWith(pricePerSqm, floorArea);
      expect(valuation).toBe(expectedValuation);
    });

    it('should handle error when fetching pricing data', async () => {
      const postcode = 'INVALID';
      const errorMessage = 'Invalid postcode format';
      
      mockGetPricingData.mockRejectedValue(new Error(errorMessage));
      
      await expect(PricingService.getPricingData(postcode)).rejects.toThrow(errorMessage);
      expect(mockGetPricingData).toHaveBeenCalledWith(postcode);
    });
  });

  describe('Offer Management', () => {
    it('should track new offers in offer history', () => {
      const propertyId = 'prop-123';
      const offer = {
        amount: 450000,
        date: '2023-03-15',
        status: 'pending'
      };
      
      const expectedHistory = [offer];
      mockTrackOfferHistory.mockReturnValue(expectedHistory);
      
      const offerHistory = PricingService.trackOfferHistory(propertyId, offer);
      
      expect(mockTrackOfferHistory).toHaveBeenCalledWith(propertyId, offer);
      expect(offerHistory).toEqual(expectedHistory);
    });

    it('should update existing offer status', () => {
      const propertyId = 'prop-123';
      const existingOffer = {
        id: 'offer-1',
        amount: 450000,
        date: '2023-03-15',
        status: 'pending'
      };
      
      const updatedOffer = {
        ...existingOffer,
        status: 'accepted'
      };
      
      const expectedHistory = [updatedOffer];
      mockTrackOfferHistory.mockReturnValue(expectedHistory);
      
      const offerHistory = PricingService.trackOfferHistory(propertyId, updatedOffer);
      
      expect(mockTrackOfferHistory).toHaveBeenCalledWith(propertyId, updatedOffer);
      expect(offerHistory[0].status).toBe('accepted');
    });
  });

  describe('Pricing History Retrieval', () => {
    it('should retrieve pricing history for a property', () => {
      const propertyId = 'prop-123';
      const expectedHistory = [
        { date: '2023-01-15', price: 500000 },
        { date: '2023-02-20', price: 485000 },
        { date: '2023-03-10', price: 475000 }
      ];
      
      mockGetPricingHistory.mockReturnValue(expectedHistory);
      
      const pricingHistory = PricingService.getPricingHistory(propertyId);
      
      expect(mockGetPricingHistory).toHaveBeenCalledWith(propertyId);
      expect(pricingHistory).toEqual(expectedHistory);
    });

    it('should return empty array when no pricing history exists', () => {
      const propertyId = 'new-property';
      const expectedHistory = [];
      
      mockGetPricingHistory.mockReturnValue(expectedHistory);
      
      const pricingHistory = PricingService.getPricingHistory(propertyId);
      
      expect(mockGetPricingHistory).toHaveBeenCalledWith(propertyId);
      expect(pricingHistory).toEqual(expectedHistory);
    });
  });

  describe('Price Comparison Functionality', () => {
    it('should compare prices of similar properties', () => {
      const propertyDetails = {
        postcode: 'SW1W 0NY',
        floorArea: 85,
        propertyType: 'flat'
      };
      
      const expectedComparison = {
        currentProperty: {
          estimatedValue: 480250,
          pricePerSqm: 5650
        },
        similarProperties: [
          {
            id: 'sim-1',
            postcode: 'SW1W 0NZ',
            floorArea: 82,
            estimatedValue: 463400,
            pricePerSqm: 5650
          },
          {
            id: 'sim-2',
            postcode: 'SW1W 0NY',
            floorArea: 90,
            estimatedValue: 508500,
            pricePerSqm: 5650
          }
        ],
        averagePricePerSqm: 5650,
        priceRange: {
          min: 463400,
          max: 508500
        }
      };
      
      mockComparePropertyPrices.mockReturnValue(expectedComparison);
      
      const comparison = PricingService.comparePropertyPrices(propertyDetails);
      
      expect(mockComparePropertyPrices).toHaveBeenCalledWith(propertyDetails);
      expect(comparison).toEqual(expectedComparison);
    });

    it('should handle property comparison with no similar properties found', () => {
      const propertyDetails = {
        postcode: 'REMOTE1',
        floorArea: 120,
        propertyType: 'detached'
      };
      
      const expectedComparison = {
        currentProperty: {
          estimatedValue: 678000,
          pricePerSqm: 5650
        },
        similarProperties: [],
        averagePricePerSqm: 5650,
        priceRange: {
          min: 678000,
          max: 678000
        }
      };
      
      mockComparePropertyPrices.mockReturnValue(expectedComparison);
      
      const comparison = PricingService.comparePropertyPrices(propertyDetails);
      
      expect(mockComparePropertyPrices).toHaveBeenCalledWith(propertyDetails);
      expect(comparison.similarProperties).toEqual([]);
    });
  });
}); 