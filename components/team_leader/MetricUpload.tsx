import React from 'react';
import MultiCSVUpload from './MultiCSVUpload';

interface MetricUploadProps {
  fileType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

const MetricUpload: React.FC<MetricUploadProps> = ({ fileType }) => {
  return (
    <div className="p-8 bg-white">
      <h3 className="text-2xl font-bold mb-4">
        Cargar {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
      </h3>
      <MultiCSVUpload fileType={fileType} />
    </div>
  );
};

export default MetricUpload;
