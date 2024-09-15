import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

interface MultiCSVUploadProps {
  fileType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

interface NPSDiarioData {
  date: Date;
  nsp: number;
  q: number;
  nps: number;
  csat: number;
  ces: number;
  rd: number;
}

const MultiCSVUpload: React.FC<MultiCSVUploadProps> = ({ fileType }) => {
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      Papa.parse(file, {
        complete: async (results: Papa.ParseResult<Record<string, string>>) => {
          const data = results.data;
          data.shift(); // Remove header row

          let formattedData: Record<string, string>[] | NPSDiarioData[];
          if (fileType === 'nps-diario') {
            formattedData = data.map((row) => ({
              date: new Date(row['NSP'] || row['Jueves 29'] || ''),
              nsp: parseInt(row['NSP'] || '0'),
              q: parseInt(row['Q'] || '0'),
              nps: parseInt(row['NPS'] || '0'),
              csat: parseFloat(row['CSAT']?.replace('%', '') || '0') / 100,
              ces: parseFloat(row['CES']?.replace('%', '') || '0') / 100,
              rd: parseFloat(row['RD']?.replace('%', '') || '0') / 100,
            }));
          } else {
            formattedData = data;
          }

          try {
            const response = await fetch('/api/metrics-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileType, data: formattedData }),
            });

            const result = await response.json();

            if (response.ok) {
              setUploadStatus(`Archivo ${file.name} subido exitosamente.`);
            } else {
              let errorMessage = result.error || 'Error desconocido';
              if (result.details) {
                errorMessage += `: ${JSON.stringify(result.details)}`;
              }
              setUploadStatus(`Error al subir ${file.name}: ${errorMessage}`);
            }
          } catch (error) {
            console.error('Error:', error);
            setUploadStatus(`Error al subir ${file.name}: Error de red o servidor`);
          }
        },
        header: true,
        skipEmptyLines: true,
      });
    });
  }, [fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    }
  });

  return (
    <div className="p-4">
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta los archivos CSV aquí ...</p>
        ) : (
          <p>Arrastra y suelta archivos CSV de {fileType} aquí, o haz clic para seleccionar archivos</p>
        )}
      </div>
      {uploadStatus && (
        <p className={`mt-4 text-center ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default MultiCSVUpload;