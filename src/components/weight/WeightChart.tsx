import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Card } from "@/components/ui/card";
import { subDays, format } from 'date-fns';

interface WeightEntry {
  _id: string;
  date: Date;
  weight: number;
  notes?: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface WeightChartProps {
  weights: WeightEntry[];
  period: '7' | '30' | '90';
  useKg: boolean;
  goalWeight?: number;
}

const WeightChart: React.FC<WeightChartProps> = ({ weights, period, useKg, goalWeight }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const filterDate = subDays(now, parseInt(period));
    
    // Filter weights based on period
    const filteredWeights = weights.filter(w => w.date >= filterDate);
    
    // Convert to format suitable for recharts
    return filteredWeights.map(w => ({
      date: format(w.date, 'MMM dd'),
      weight: w.weight,
      unit: w.unit
    })).sort((a, b) => {
      // Ensure data is sorted by date (oldest to newest)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [weights, period]);

  // Calculate moving average (7-day)
  const movingAverage = useMemo(() => {
    if (chartData.length < 7) return [];
    
    return chartData.map((_, index) => {
      if (index < 3) return null;
      if (index > chartData.length - 4) return null;
      
      // Get 7 days centered around current point
      const slice = chartData.slice(Math.max(0, index - 3), Math.min(chartData.length, index + 4));
      const sum = slice.reduce((acc, day) => acc + day.weight, 0);
      return {
        date: chartData[index].date,
        avg: sum / slice.length,
      };
    }).filter(Boolean);
  }, [chartData]);

  // Calculate min and max for Y axis
  const minWeight = weights.length > 0
    ? Math.min(...weights.map(w => w.weight), goalWeight || Infinity) - 2
    : 50;
  const maxWeight = weights.length > 0
    ? Math.max(...weights.map(w => w.weight), goalWeight || 0) + 2
    : 100;

  return (
    <Card className="p-4">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={true}
            />
            <YAxis 
              domain={[minWeight, maxWeight]}
              tickCount={5}
              tickFormatter={(value) => `${value} ${useKg ? 'kg' : 'lb'}`}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'weight') return [`${value} ${useKg ? 'kg' : 'lb'}`, 'Weight'];
                if (name === 'avg') return [`${value} ${useKg ? 'kg' : 'lb'}`, '7-Day Average'];
                return [value, name];
              }}
            />
            {goalWeight && <ReferenceLine y={goalWeight} label="Goal" stroke="#8884d8" strokeDasharray="3 3" />}
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#9b87f5" 
              strokeWidth={2}
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
            {movingAverage.length > 0 && (
              <Line 
                type="monotone" 
                data={movingAverage}
                dataKey="avg" 
                stroke="#0EA5E9" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>Not enough data to display chart. Log your weight to see progress.</p>
        </div>
      )}
    </Card>
  );
};

export default WeightChart;
