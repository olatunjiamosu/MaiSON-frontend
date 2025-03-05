import React from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  TooltipProps
} from 'recharts';
import { PriceDataPoint } from '../../types/pricing';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface PriceHistoryChartProps {
  data: PriceDataPoint[];
  recommendedYear?: number;
}

// Chart data format
interface ChartDataPoint {
  year: number;
  median: number;
  mean: number;
  lowerBound: number;
  upperBound: number;
  count: number;
}

// MaiSON emerald color palette
const colors = {
  emerald100: '#D1FAE5',
  emerald300: '#6EE7B7',
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065F46'
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, recommendedYear }) => {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full mt-8 mb-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Historical Price per m² (1995-Present)
        </h3>
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-emerald-200 rounded-lg">
          <p className="text-gray-500">No historical price data available for this area.</p>
        </div>
      </div>
    );
  }

  // Sort data by year ascending
  const sortedData = [...data]
    .sort((a, b) => a.year - b.year)
    // Filter out entries with no bounds (insufficient data)
    .filter(point => point.count > 1);
  
  // If we have no valid data points after filtering
  if (sortedData.length === 0) {
    return (
      <div className="w-full mt-8 mb-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Historical Price per m² (1995-Present)
        </h3>
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-emerald-200 rounded-lg">
          <p className="text-gray-500">Insufficient data points for visualization.</p>
        </div>
      </div>
    );
  }

  // Format data for chart display
  const chartData = sortedData.map(point => ({
    year: point.year,
    median: point.median,
    mean: point.mean,
    lowerBound: typeof point.lower_bound === 'number' ? point.lower_bound : point.median * 0.9,
    upperBound: typeof point.upper_bound === 'number' ? point.upper_bound : point.median * 1.1,
    count: point.count
  }));

  // Calculate y-axis domain with some padding
  const minValue = Math.min(...chartData.map(d => d.lowerBound));
  const maxValue = Math.max(...chartData.map(d => d.upperBound));
  const padding = (maxValue - minValue) * 0.1;
  const yDomain = [Math.max(0, minValue - padding), maxValue + padding];

  // Format price display
  const formatPrice = (value: number) => {
    return `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
  };

  // Custom tooltip formatter
  const customTooltipFormatter = (value: ValueType, name: NameType) => {
    if (typeof value === 'number') {
      return formatPrice(value);
    }
    return value;
  };

  // Custom label formatter
  const customLabelFormatter = (label: any) => {
    return `Year: ${label}`;
  };

  // Custom dot renderer
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Highlight the recommended year
    if (payload.year === recommendedYear) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          fill={colors.emerald500} 
          stroke={colors.emerald700}
          strokeWidth={2}
        />
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill={colors.emerald600} />;
  };

  return (
    <div className="w-full mt-8 mb-6 bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Historical Price per m² (1995-Present)
        </h3>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.emerald100} />
              <XAxis 
                dataKey="year" 
                label={{ 
                  value: 'Year', 
                  position: 'insideBottomRight', 
                  offset: -10,
                  style: { fill: colors.emerald800, fontWeight: 500, fontSize: 14 }
                }} 
                padding={{ left: 20, right: 20 }}
                tick={{ fill: colors.emerald800 }}
                dy={10}
              />
              <YAxis 
                domain={yDomain}
                tickFormatter={formatPrice}
                label={{ 
                  value: 'Price per m²', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: colors.emerald800, fontWeight: 500, fontSize: 14 },
                  dx: -10
                }}
                tick={{ fill: colors.emerald800 }}
                width={80}
              />
              <Tooltip 
                formatter={customTooltipFormatter}
                labelFormatter={customLabelFormatter}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderColor: colors.emerald300,
                  borderRadius: '6px',
                  padding: '10px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  color: colors.emerald800,
                  paddingTop: '10px'
                }}
                verticalAlign="bottom"
                height={36}
              />
              <Area 
                type="monotone" 
                dataKey="upperBound" 
                stroke="none" 
                fillOpacity={0.2}
                fill={colors.emerald300} 
                name="Upper Bound"
              />
              <Area 
                type="monotone" 
                dataKey="lowerBound" 
                stroke="none" 
                fillOpacity={0.2}
                fill={colors.emerald300} 
                name="Lower Bound" 
              />
              <Line 
                type="monotone" 
                dataKey="median" 
                stroke={colors.emerald600} 
                strokeWidth={2.5}
                activeDot={{ r: 8, fill: colors.emerald500 }}
                name="Median Price"
                dot={renderCustomDot}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <p>
            Note: Data based on property transactions in the broader postcode sector.
            <br />
            Source: Land Registry Price Paid Data and EPC certificates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart; 