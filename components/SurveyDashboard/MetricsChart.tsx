// components/SurveyDashboard/MetricsChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  date: string;
  moodRating: number;
  workEnvironment: number;
  personalWellbeing: number;
  workLifeBalance: number;
  stressLevel: number;
}

interface ChartProps {
  data: ChartData[];
}

export const MetricsChart: React.FC<ChartProps> = ({ data }) => (
  <Card className="col-span-3">
    <CardHeader>
      <CardTitle>Tendencias en el tiempo</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#8884d8" 
              name="Promedio" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);