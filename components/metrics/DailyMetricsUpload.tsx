'use client';

import { useState, useRef, DragEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyMetric {
  id: number;
  name: string;
  q: number;
  nps: number;
  csat: number;
  ces: number;
  rd: number;
  createdAt: string;
  team: {
    name: string;
  } | null;
}

interface DailyMetricsUploadProps {
  hideUpload?: boolean;
}

export default function DailyMetricsUpload({ hideUpload = false }: DailyMetricsUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMetrics = async () => {
    setFetchingData(true);
    try {
      const response = await fetch('/api/metrics/daily-metrics', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener los datos');
      }

      const sortedMetrics = data.metrics.sort((a: DailyMetric, b: DailyMetric) => 
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );

      setMetrics(sortedMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMessage(error instanceof Error ? error.message : 'Error al obtener los datos');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleFile = (file: File) => {
    if (file.name.endsWith('.csv')) {
      setFile(file);
      setMessage('Archivo seleccionado: ' + file.name);
    } else {
      setFile(null);
      setMessage('Por favor seleccione un archivo CSV');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Por favor seleccione un archivo primero');
      return;
    }

    setLoading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/metrics/daily-metrics', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setMessage(`Archivo subido exitosamente. Se procesaron ${data.count} registros.`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchMetrics();
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage(error instanceof Error ? error.message : 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value).toFixed(1)}%`;
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 p-6">
      {!hideUpload && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Cargar Métricas Diarias
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Sube tu archivo CSV con las métricas del equipo
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-10
                  transition-all duration-200 ease-in-out cursor-pointer
                  flex flex-col items-center justify-center gap-4
                  ${isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary hover:bg-primary/5'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="rounded-full p-3 bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">
                    {file 
                      ? `Archivo seleccionado: ${file.name}`
                      : 'Arrastra tu archivo CSV aquí'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    o haz clic para seleccionar
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="w-full font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Subiendo...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Subir archivo
                  </span>
                )}
              </Button>

              {message && (
                <p className={`text-sm font-medium text-center animate-fadeIn ${
                  message.includes('Error') 
                    ? 'text-destructive' 
                    : 'text-primary'
                }`}>
                  {message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center justify-between">
            Métricas Cargadas
            {!fetchingData && metrics.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {metrics.length} registros
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            {fetchingData ? (
              <div className="p-4">
                <LoadingSkeleton />
              </div>
            ) : metrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold text-right">Q</TableHead>
                    <TableHead className="font-semibold text-right">NPS</TableHead>
                    <TableHead className="font-semibold text-right">CSAT</TableHead>
                    <TableHead className="font-semibold text-right">CES</TableHead>
                    <TableHead className="font-semibold text-right">RD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow 
                      key={metric.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">{metric.name}</TableCell>
                      <TableCell className="text-right">{metric.q}</TableCell>
                      <TableCell className="text-right">{formatPercentage(metric.nps)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(metric.csat)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(metric.ces)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(metric.rd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No hay métricas cargadas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}