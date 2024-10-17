import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { UploadCloud } from 'lucide-react';

interface MultiCSVUploadProps {
  fileType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

interface MetricData {
  [key: string]: number | string;
}

const MultiCSVUpload: React.FC<MultiCSVUploadProps> = ({ fileType }) => {
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      Papa.parse(file, {
        complete: async (results: Papa.ParseResult<Record<string, string>>) => {
          if (results.data && Array.isArray(results.data) && results.data.length > 0) {
            const headers = Object.keys(results.data[0]);
            const dateColumn = headers.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('fecha')) || 'date';
            
            const formattedData: MetricData[] = results.data.map((row) => {
              const formattedRow: MetricData = {};
              headers.forEach(header => {
                if (header === dateColumn) {
                  formattedRow[header] = new Date(row[header]).toISOString();
                } else if (!isNaN(Number(row[header]))) {
                  formattedRow[header] = Number(row[header]);
                } else {
                  formattedRow[header] = row[header];
                }
              });
              return formattedRow;
            });

            try {
              const response = await fetch(`/api/upload/${fileType}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metrics: formattedData }),
              });

              if (response.ok) {
                setUploadStatus(`Archivo ${file.name} cargado exitosamente`);
              } else {
                const errorData = await response.json();
                setUploadStatus(`Error al cargar ${file.name}: ${errorData.message || 'Error desconocido'}`);
              }
            } catch (error) {
              console.error('Error:', error);
              setUploadStatus(`Error al cargar ${file.name}: Error de red`);
            }
          } else {
            setUploadStatus(`Error: No se pudieron procesar los datos del archivo ${file.name}`);
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
    },
    multiple: true
  });

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer bg-white hover:bg-gray-50 transition duration-300">
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        {isDragActive ? (
          <p className="mt-2 text-sm text-gray-600">Suelta los archivos CSV aquí ...</p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">Arrastra y suelta archivos CSV de {fileType} aquí, o haz clic para seleccionar archivos</p>
        )}
      </div>
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-md ${uploadStatus.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default MultiCSVUpload;