'use client'
import React, { useState } from 'react';
import Sidebar from './sidebar';
import MetricUpload from './MetricUpload';
import MetricVisualization from './MetricVisualization';
import { BarChart2, Clock, Activity, ThumbsUp } from 'lucide-react';
import { MetricType, ViewType, MetricOption } from '@/types/metrics';

const METRIC_OPTIONS: MetricOption[] = [
  { type: 'trimestral' as MetricType, label: 'Métricas Trimestrales', icon: BarChart2 },
  { type: 'semanal' as MetricType, label: 'Métricas Semanales', icon: Clock },
  { type: 'tmo' as MetricType, label: 'Métricas TMO', icon: Activity },
  { type: 'nps-diario' as MetricType, label: 'NPS Diario', icon: ThumbsUp },
];

const Dashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<ViewType>('metrics');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('trimestral');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
  };

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        onViewChange={handleViewChange} 
        onMetricChange={handleMetricChange}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
        selectedView={selectedView}
        selectedMetric={selectedMetric}
        metricOptions={METRIC_OPTIONS}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {selectedView === 'metrics' ? 'Visualización de Métricas' : 'Carga de Métricas'}
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow">
            {selectedView === 'upload' ? (
              <MetricUpload fileType={selectedMetric} />
            ) : (
              <MetricVisualization metricType={selectedMetric} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;