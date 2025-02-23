import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Home,
  Clock,
  PoundSterling,
  Activity
} from 'lucide-react';

interface MarketTrend {
  period: string;
  averagePrice: string;
  percentageChange: number;
  salesVolume: number;
  averageDaysOnMarket: number;
}

const mockTrends: MarketTrend[] = [
  {
    period: 'Last Month',
    averagePrice: '£485,000',
    percentageChange: 2.5,
    salesVolume: 145,
    averageDaysOnMarket: 45
  },
  // Add more periods...
];

const MarketInsightsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Market Insights</h2>
        <p className="text-gray-500">Local market trends and analysis</p>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Property Price</p>
              <h3 className="text-2xl font-bold text-gray-900">£485,000</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <PoundSterling className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            <span className="text-emerald-600">2.5% increase</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Properties Sold</p>
              <h3 className="text-2xl font-bold text-gray-900">145</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <Home className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">5% decrease</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Days on Market</p>
              <h3 className="text-2xl font-bold text-gray-900">45 days</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-emerald-600 mr-1" />
            <span className="text-emerald-600">3 days faster</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Market Activity</p>
              <h3 className="text-2xl font-bold text-gray-900">High</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            <span className="text-emerald-600">Active</span>
            <span className="text-gray-500 ml-2">buyer's market</span>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Price Trends */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Local Price Trends</h3>
            <p className="text-sm text-gray-500">Average property prices in your area</p>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500">
              [Price Trend Chart Placeholder]
            </div>
          </div>
        </div>

        {/* Market Activity */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Sales Activity</h3>
            <p className="text-sm text-gray-500">Number of properties sold in your area</p>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500">
              [Sales Activity Chart Placeholder]
            </div>
          </div>
        </div>
      </div>

      {/* Market Recommendations */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Recommendations</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Price Optimization</h4>
              <p className="text-sm text-blue-700">
                Based on current market trends, consider adjusting your property price. 
                Similar properties in your area are selling 5% above average.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-900">Timing</h4>
              <p className="text-sm text-emerald-700">
                Current market activity suggests this is a good time to list. 
                Properties are selling 15% faster than the previous quarter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsightsSection; 