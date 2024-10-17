'use client'
import React, { useState } from 'react';
import Sidebar from './sidebar';
import MetricUpload from './MetricUpload';
import MetricVisualization from './MetricVisualization';

type MetricType = 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
type ViewType = 'upload' | 'metrics';

const Dashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<ViewType>('metrics');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('trimestral');

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
  };

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
  };

  return (
    <div className="flex h-screen">
      <Sidebar onViewChange={handleViewChange} onMetricChange={handleMetricChange} />
      <div className="flex-1 ml-64 p-8">
        {selectedView === 'upload' && <MetricUpload fileType={selectedMetric} />}
        {selectedView === 'metrics' && <MetricVisualization metricType={selectedMetric} />}
      </div>
    </div>
  );
};

export default Dashboard;