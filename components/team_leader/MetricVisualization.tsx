// MetricVisualization.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MetricVisualizationProps {
  metricType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

const MetricVisualization: React.FC<MetricVisualizationProps> = ({ metricType }) => {
  const [metricData, setMetricData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricData(metricType);
  }, [metricType]);

  const fetchMetricData = async (type: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/${type}`);
      if (response.ok) {
        const data = await response.json();
        setMetricData(data);
        setError('');
      } else {
        setError('Error al cargar los datos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metricData.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No hay datos disponibles para mostrar
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metricData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px'
              }}
            />
            <Legend />
            {Object.keys(metricData[0])
              .filter(key => key !== 'date')
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`hsl(${index * 45}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricVisualization;