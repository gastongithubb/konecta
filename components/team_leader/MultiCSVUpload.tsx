import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadCloud } from 'lucide-react';

interface MultiCSVUploadProps {
  fileType: 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
}

const MultiCSVUpload: React.FC<MultiCSVUploadProps> = ({ fileType }) => {
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        const parseFile = () => new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
          });
        });

        const parsedData = await parseFile();

        // Ahora usando endpoints específicos
        const response = await fetch(`/api/metrics-upload/${fileType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al cargar el archivo');
        }

        setUploadStatus({
          type: 'success',
          message: `Archivo ${file.name} cargado exitosamente`
        });

      } catch (error) {
        setUploadStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
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
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Suelta los archivos aquí ...'
            : `Arrastra y suelta archivos CSV de ${fileType} aquí, o haz clic para seleccionar`}
        </p>
      </div>

      {uploadStatus.type && (
        <Alert 
          variant={uploadStatus.type === 'success' ? 'default' : 'destructive'}
          className="mt-4"
        >
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MultiCSVUpload;