import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart2, Clock, Activity, ThumbsUp, Upload, PieChart } from 'lucide-react';

type MetricType = 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
type ViewType = 'upload' | 'metrics';

interface MetricOption {
  type: MetricType;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  onViewChange: (view: ViewType) => void;
  onMetricChange: (metric: MetricType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onViewChange, onMetricChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedView, setSelectedView] = useState<ViewType>('metrics');
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const metricOptions: MetricOption[] = [
    { type: 'trimestral', label: 'Métricas Trimestrales', icon: BarChart2 },
    { type: 'semanal', label: 'Métricas Semanales', icon: Clock },
    { type: 'tmo', label: 'Métricas TMO', icon: Activity },
    { type: 'nps-diario', label: 'NPS Diario', icon: ThumbsUp },
  ];

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    onViewChange(view);
  };

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
    onMetricChange(metric);
  };

  return (
    <div className={`bg-[#F9FAFB] text-black transition-all duration-300 fixed left-0 top-16 bottom-0 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 bg-[#32314e] flex justify-between items-center">
        <h2 className={`text-xl font-semibold text-white ${isExpanded ? '' : 'hidden'}`}>Dashboard</h2>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-white">
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>
      <div className="mt-4 overflow-y-auto h-full">
        <button
          onClick={() => handleViewChange('metrics')}
          className={`w-full text-left px-4 py-3 flex items-center ${
            selectedView === 'metrics' ? 'bg-[#32314e] text-white' : 'hover:bg-gray-300'
          }`}
        >
          <PieChart className="mr-3" size={20} />
          {isExpanded && <span>Ver Métricas</span>}
        </button>
        <button
          onClick={() => handleViewChange('upload')}
          className={`w-full text-left px-4 py-3 flex items-center ${
            selectedView === 'upload' ? 'bg-[#32314e] text-white' : 'hover:bg-gray-300'
          }`}
        >
          <Upload className="mr-3" size={20} />
          {isExpanded && <span>Cargar Métricas</span>}
        </button>
        {metricOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleMetricChange(option.type)}
            className={`w-full text-left px-4 py-3 flex items-center ${
              selectedMetric === option.type ? 'bg-[#32314e] text-white' : 'hover:bg-gray-300'
            }`}
          >
            <option.icon className="mr-3" size={20} />
            {isExpanded && <span>{option.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;