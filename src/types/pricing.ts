// Pricing API response interfaces

export interface PriceDataPoint {
  count: number;
  lower_bound: number | null;
  mean: number;
  median: number;
  std: number | null;
  upper_bound: number | null;
  year: number;
}

export interface PricingApiResponse {
  price_per_floor_area_per_year: PriceDataPoint[];
}

export interface ValuationFormData {
  postcode: string;
  floorArea?: number;
  propertyType?: 'flat' | 'terraced' | 'semi-detached' | 'detached';
}

export interface PriceRecommendation {
  pricePerSqm: number;
  totalValue?: number;
  confidence: 'low' | 'medium' | 'high';
  year: number;
  sampleSize: number;
} 