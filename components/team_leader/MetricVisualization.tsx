import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricVisualizationProps {
  metricType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

const MetricVisualization: React.FC<MetricVisualizationProps> = ({ metricType }) => {
  const [metricData, setMetricData] = useState<any[]>([]);

  useEffect(() => {
    fetchMetricData(metricType);
  }, [metricType]);

  const fetchMetricData = async (metricType: string) => {
    try {
      const response = await fetch(`/api/metrics/${metricType}`);
      if (response.ok) {
        const data = await response.json();
        setMetricData(data);
      } else {
        console.error('Error fetching metric data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderMetricChart = () => {
    if (!metricData.length) return <p>No hay datos disponibles</p>;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={metricData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(metricData[0]).filter(key => key !== 'date').map((key, index) => (
            <Line key={key} type="monotone" dataKey={key} stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-8 bg-white">
      <h3 className="text-2xl font-bold mb-4">
        {metricType.charAt(0).toUpperCase() + metricType.slice(1)}
      </h3>
      {renderMetricChart()}
    </div>
  );
};

export default MetricVisualization;