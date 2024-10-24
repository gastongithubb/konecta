// components/SurveyDashboard/components/TrendsChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';
import type { ChartDataPoint } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface TrendsChartProps {
  data: ChartDataPoint[];
}

export const TrendsChart = ({ data }: TrendsChartProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Tendencias en el tiempo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="text-sm text-gray-600">
            {new Date(label).toLocaleDateString('es-ES')}
          </p>
          {payload.map((entry) => (
            <p
              key={entry.name}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${Number(entry.value).toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Tendencias en el tiempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => 
                  new Date(value).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric'
                  })
                }
              />
              <YAxis domain={[0, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="moodRating"
                stroke="#8884d8"
                name="Estado de ánimo"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="workEnvironment"
                stroke="#82ca9d"
                name="Ambiente laboral"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="stressLevel"
                stroke="#ff7300"
                name="Nivel de estrés"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendsChart;