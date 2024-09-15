import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

interface CSVRow {
  [key: string]: string;
}

const CSVUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    Papa.parse<CSVRow>(file, {
      complete: async (results) => {
        const data = results.data;
        // Remove header row
        data.shift();
        
        // Process and format the data
        const formattedData = data.map(row => ({
          date: new Date(row['NSP'] || ''),
          nsp: parseInt(row['NSP'] || '0'),
          q: parseInt(row['Q'] || '0'),
          nps: parseInt(row['NPS'] || '0'),
          csat: parseFloat(row['CSAT'] || '0') / 100,
          ces: parseFloat(row['CES'] || '0') / 100,
          rd: parseFloat(row['RD'] || '0') / 100,
        }));

        try {
          const response = await fetch('/api/nps-diario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ metrics: formattedData }),
          });

          const result = await response.json();

          if (response.ok) {
            setUploadStatus('Archivo subido exitosamente');
          } else {
            setUploadStatus(`Error: ${result.message || 'Ocurrió un error desconocido'}`);
          }
        } catch (error) {
          console.error('Error:', error);
          setUploadStatus('Error al subir el archivo: Error de red');
        }
      },
      header: true,
      skipEmptyLines: true,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="p-4">
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta el archivo CSV aquí ...</p>
        ) : (
          <p>Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionar un archivo</p>
        )}
      </div>
      {uploadStatus && (
        <p className={`mt-4 text-center ${uploadStatus.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default CSVUpload;