// MetricUpload.tsx
import React from 'react';
import MultiCSVUpload from './MultiCSVUpload';

interface MetricUploadProps {
  fileType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

const MetricUpload: React.FC<MetricUploadProps> = ({ fileType }) => {
  return (
    <div className="p-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Cargar métricas {fileType}
      </h3>
      <MultiCSVUpload fileType={fileType} />
    </div>
  );
};

export default MetricUpload;