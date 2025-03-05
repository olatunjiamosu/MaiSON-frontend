import React, { useState } from 'react';
import { ValuationFormData, PricingApiResponse, PriceRecommendation } from '../../types/pricing';
import PricingService from '../../services/PricingService';
import PriceHistoryChart from './PriceHistoryChart';

interface ValuationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ValuationForm: React.FC<ValuationFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<ValuationFormData>({
    postcode: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingData, setPricingData] = useState<PricingApiResponse | null>(null);
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'floorArea' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate postcode (basic UK postcode format)
      const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
      if (!postcodeRegex.test(formData.postcode)) {
        throw new Error('Please enter a valid UK postcode (e.g., SW4 0ES)');
      }

      // Fetch pricing data
      const data = await PricingService.getPricingData(formData.postcode);
      setPricingData(data);

      // Calculate recommendation
      const rec = PricingService.getRecommendedPrice(data);
      if (rec) {
        // Add total value if floor area is provided
        if (formData.floorArea && formData.floorArea > 0) {
          rec.totalValue = rec.pricePerSqm * formData.floorArea;
        }
        setRecommendation(rec);
      } else {
        setError('Unable to generate a valuation from the available data');
      }
    } catch (err) {
      console.error('Valuation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch property data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Property Valuation</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!pricingData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  placeholder="e.g., SW4 0ES"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a valid UK postcode to get property valuation data
                </p>
              </div>

              <div>
                <label htmlFor="floorArea" className="block text-sm font-medium text-gray-700">
                  Floor Area (m²) - Optional
                </label>
                <input
                  type="number"
                  id="floorArea"
                  name="floorArea"
                  value={formData.floorArea || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 85"
                  min="1"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Providing floor area allows us to calculate total property value
                </p>
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                  Property Type - Optional
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select property type</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="terraced">Terraced House</option>
                  <option value="semi-detached">Semi-Detached House</option>
                  <option value="detached">Detached House</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Valuation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Valuation Results for {formData.postcode}
                </h3>
                <p className="text-sm text-gray-500">
                  Based on historical property transactions in this area
                </p>
              </div>

              {recommendation && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-emerald-800 mb-2">
                    Recommended Valuation ({recommendation.year})
                  </h4>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-emerald-700">
                      £{recommendation.pricePerSqm.toLocaleString('en-GB', { maximumFractionDigits: 0 })} per m²
                    </p>
                    
                    {recommendation.totalValue && (
                      <p className="text-lg">
                        Estimated total value: <span className="font-semibold">
                          £{recommendation.totalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          (based on {formData.floorArea} m²)
                        </span>
                      </p>
                    )}
                    
                    <div className="flex items-center mt-1">
                      <span className="text-sm mr-2">Confidence:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.confidence === 'high' 
                          ? 'bg-green-100 text-green-800' 
                          : recommendation.confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {recommendation.confidence.charAt(0).toUpperCase() + recommendation.confidence.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Based on {recommendation.sampleSize} properties)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {pricingData.price_per_floor_area_per_year.length > 0 ? (
                <PriceHistoryChart 
                  data={pricingData.price_per_floor_area_per_year} 
                  recommendedYear={recommendation?.year}
                />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700">No historical price data available for this postcode.</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPricingData(null);
                    setRecommendation(null);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Try Another Postcode
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationForm; 