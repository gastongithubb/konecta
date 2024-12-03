// Sidebar.tsx (actualizado)
import React from 'react';
import { ChevronLeft, ChevronRight, PieChart, Upload } from 'lucide-react';
import { MetricType, ViewType, MetricOption } from '@/types/metrics';

interface SidebarProps {
  onViewChange: (view: ViewType) => void;
  onMetricChange: (metric: MetricType) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedView: ViewType;
  selectedMetric: MetricType;
  metricOptions: MetricOption[];
}

const Sidebar: React.FC<SidebarProps> = ({
  onViewChange,
  onMetricChange,
  isExpanded,
  onToggleExpand,
  selectedView,
  selectedMetric,
  metricOptions
}) => {
  return (
    <div 
      className={`bg-white shadow-lg fixed left-0 top-0 bottom-0 transition-all duration-300 
        ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      <div className="p-4 bg-[#32314e] flex justify-between items-center">
        <h2 className={`text-xl font-semibold text-white ${isExpanded ? '' : 'hidden'}`}>
          Dashboard
        </h2>
        <button 
          onClick={onToggleExpand}
          className="text-white hover:bg-[#3f3e61] p-2 rounded-lg"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="mt-6">
        {/* View Options */}
        <div className="px-3 mb-6">
          <button
            onClick={() => onViewChange('metrics')}
            className={`w-full text-left p-3 rounded-lg flex items-center mb-2
              ${selectedView === 'metrics' 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-100'}`}
          >
            <PieChart className="mr-3" size={20} />
            {isExpanded && <span>Ver Métricas</span>}
          </button>

          <button
            onClick={() => onViewChange('upload')}
            className={`w-full text-left p-3 rounded-lg flex items-center
              ${selectedView === 'upload' 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-100'}`}
          >
            <Upload className="mr-3" size={20} />
            {isExpanded && <span>Cargar Métricas</span>}
          </button>
        </div>

        {/* Metric Options */}
        <div className="px-3">
          {metricOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => onMetricChange(option.type)}
              className={`w-full text-left p-3 rounded-lg flex items-center mb-2
                ${selectedMetric === option.type 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'hover:bg-gray-100'}`}
            >
              <option.icon className="mr-3" size={20} />
              {isExpanded && <span>{option.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;