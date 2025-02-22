import React from 'react';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock
} from 'lucide-react';

interface PropertyAnalytics {
  id: string;
  address: string;
  viewsThisWeek: number;
  viewsTrend: number;
  savedCount: number;
  savedTrend: number;
  inquiries: number;
  inquiriesTrend: number;
  averageTimeOnPage: string;
}

const mockAnalytics: PropertyAnalytics[] = [
  {
    id: '1',
    address: '123 Park Avenue, London',
    viewsThisWeek: 156,
    viewsTrend: 23,
    savedCount: 45,
    savedTrend: -5,
    inquiries: 12,
    inquiriesTrend: 8,
    averageTimeOnPage: '2m 45s',
  },
  // Add more properties...
];

const AnalyticsSection = () => {
  // Mock total statistics
  const totalStats = {
    totalViews: 1250,
    totalSaved: 180,
    totalInquiries: 45,
    averageResponseTime: '2.5 hours'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500">Track your properties' performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalStats.totalViews}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <Eye className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            <span className="text-emerald-600">12% increase</span>
            <span className="text-gray-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saved Properties</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalStats.totalSaved}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            <span className="text-emerald-600">8% increase</span>
            <span className="text-gray-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Inquiries</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalStats.totalInquiries}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">3% decrease</span>
            <span className="text-gray-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Response Time</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalStats.averageResponseTime}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            <span className="text-emerald-600">Faster</span>
            <span className="text-gray-500 ml-2">vs last week</span>
          </div>
        </div>
      </div>

      {/* Property-specific Analytics */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAnalytics.map((property) => (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{property.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{property.viewsThisWeek}</span>
                      <span className={`ml-2 text-xs ${property.viewsTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {property.viewsTrend > 0 ? '+' : ''}{property.viewsTrend}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{property.savedCount}</span>
                      <span className={`ml-2 text-xs ${property.savedTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {property.savedTrend > 0 ? '+' : ''}{property.savedTrend}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{property.inquiries}</span>
                      <span className={`ml-2 text-xs ${property.inquiriesTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {property.inquiriesTrend > 0 ? '+' : ''}{property.inquiriesTrend}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{property.averageTimeOnPage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection; 