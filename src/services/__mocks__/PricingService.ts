import { PricingApiResponse, PriceRecommendation, PriceDataPoint, ValuationFormData } from '../../types/pricing';

// Mock data for tests
export const mockPriceDataPoints: PriceDataPoint[] = [
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

export const mockPricingApiResponse: PricingApiResponse = {
  price_per_floor_area_per_year: mockPriceDataPoints
};

// Interfaces for additional mock functionality
export interface PropertyComparison {
  currentProperty: {
    estimatedValue: number;
    pricePerSqm: number;
  };
  similarProperties: Array<{
    id: string;
    postcode: string;
    floorArea: number;
    estimatedValue: number;
    pricePerSqm: number;
  }>;
  averagePricePerSqm: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface Offer {
  id?: string;
  amount: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
}

// Mock implementation of PricingService
const mockPricingService = {
  getPricingData: jest.fn(async (postcode: string): Promise<PricingApiResponse> => {
    if (!postcode || postcode === 'INVALID') {
      throw new Error('Invalid postcode format');
    }
    return mockPricingApiResponse;
  }),

  getRecommendedPrice: jest.fn((data: PricingApiResponse): PriceRecommendation | null => {
    if (!data.price_per_floor_area_per_year || data.price_per_floor_area_per_year.length === 0) {
      return null;
    }

    // Get the most recent year's data
    const sortedData = [...data.price_per_floor_area_per_year]
      .sort((a, b) => b.year - a.year);
    
    const mostRecentData = sortedData[0];

    return {
      pricePerSqm: mostRecentData.median,
      confidence: mostRecentData.count > 15 ? 'high' : (mostRecentData.count > 5 ? 'medium' : 'low'),
      year: mostRecentData.year,
      sampleSize: mostRecentData.count
    };
  }),

  calculateTotalValuation: jest.fn((pricePerSqm: number, floorArea: number): number => {
    return pricePerSqm * floorArea;
  }),

  comparePropertyPrices: jest.fn((propertyDetails: ValuationFormData): PropertyComparison => {
    const { postcode, floorArea = 0, propertyType } = propertyDetails;
    const pricePerSqm = 5650; // Default price per sqm from mock data
    
    // Calculate estimated value
    const estimatedValue = floorArea * pricePerSqm;
    
    // Create mock similar properties
    const similarProperties = postcode === 'REMOTE1' ? [] : [
      {
        id: 'sim-1',
        postcode: `${postcode.split(' ')[0]}Z`,
        floorArea: Math.floor(floorArea * 0.95),
        estimatedValue: Math.floor(pricePerSqm * (floorArea * 0.95)),
        pricePerSqm
      },
      {
        id: 'sim-2',
        postcode,
        floorArea: Math.floor(floorArea * 1.05),
        estimatedValue: Math.floor(pricePerSqm * (floorArea * 1.05)),
        pricePerSqm
      }
    ];
    
    // Calculate min and max prices
    const prices = [estimatedValue, ...similarProperties.map(p => p.estimatedValue)];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return {
      currentProperty: {
        estimatedValue,
        pricePerSqm
      },
      similarProperties,
      averagePricePerSqm: pricePerSqm,
      priceRange: {
        min,
        max
      }
    };
  }),

  trackOfferHistory: jest.fn((propertyId: string, offer: Offer): Offer[] => {
    // Mock implementation that just returns the offer in an array
    return [offer];
  }),

  getPricingHistory: jest.fn((propertyId: string): PriceHistory[] => {
    if (propertyId === 'new-property') {
      return [];
    }
    
    // Return mock pricing history for existing properties
    return [
      { date: '2023-01-15', price: 500000 },
      { date: '2023-02-20', price: 485000 },
      { date: '2023-03-10', price: 475000 }
    ];
  })
};

export default mockPricingService; 