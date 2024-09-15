import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart2, Clock, Activity, ThumbsUp } from 'lucide-react';
import MultiCSVUpload from './MultiCSVUpload';

type UploadType = 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<UploadType | null>(null);

  const uploadOptions: { type: UploadType; label: string; icon: React.ElementType }[] = [
    { type: 'trimestral', label: 'Métricas Trimestrales', icon: BarChart2 },
    { type: 'semanal', label: 'Métricas Semanales', icon: Clock },
    { type: 'tmo', label: 'Métricas TMO', icon: Activity },
    { type: 'nps-diario', label: 'NPS Diario', icon: ThumbsUp },
  ];

  return (
    <div className="flex h-full">
      <div className={`bg-[#003153] text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
        <div className="p-4 bg-[#32314e] flex justify-between items-center">
          <h2 className={`text-xl font-semibold ${isExpanded ? '' : 'hidden'}`}>Cargar Métricas</h2>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-white">
            {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
        <div className="mt-4">
          {uploadOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedUpload(option.type)}
              className={`w-full text-left px-4 py-3 flex items-center ${
                selectedUpload === option.type
                  ? 'bg-[#32314e] text-white'
                  : 'hover:bg-gray-800'
              }`}
            >
              <option.icon className="mr-3" size={20} />
              {isExpanded && <span>{option.label}</span>}
            </button>
          ))}
        </div>
      </div>
      {selectedUpload && (
        <div className="flex-1 p-8 bg-white">
          <h3 className="text-2xl font-bold mb-4">
            Cargar {uploadOptions.find(o => o.type === selectedUpload)?.label}
          </h3>
          <MultiCSVUpload fileType={selectedUpload} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;