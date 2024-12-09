'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isPasswordChanged: boolean;
  teamId: number | null;
  teamLead?: {
    id: number;
  };
}

interface TMOMetric {
  id: number;
  name: string;
  qLlAtendidas: number;
  tiempoACD: string;
  acw: string;
  hold: string;
  ring: string;
  tmo: string;
  teamId: number;
  teamLeaderId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

const TMOMetricsTable = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<TMOMetric[]>([]);
  const [historicalData, setHistoricalData] = useState<TMOMetric[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10
  });
  const [showingHistorical, setShowingHistorical] = useState(true);

  const fetchHistoricalData = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/tmo?page=${page}&search=${search}`);
      if (!response.ok) throw new Error('Error al cargar datos históricos');
      const data = await response.json();
      setHistoricalData(data.metrics);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos históricos",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendDataToServer = useCallback(async (metricsData: TMOMetric[]) => {
    try {
      const response = await fetch('/api/metrics/tmo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricsData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }

      toast({
        title: "Éxito",
        description: "Los datos se han guardado correctamente",
      });

      fetchHistoricalData(1, searchTerm);
    } catch (err) {
      setError('Error al guardar los datos en el servidor');
      console.error('Error saving data:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los datos",
      });
    }
  }, [toast, fetchHistoricalData, searchTerm]);

  const parseCSVData = useCallback((csvString: string): TMOMetric[] => {
    if (!user || user.role !== 'team_leader' || !user.teamLead) {
      return [];
    }

    const rows = csvString.split('\n');
    const validRows = rows.filter(row => row.trim().length > 0);
    if (validRows.length < 2) return [];
    
    return validRows.slice(1).map((row: string, index: number) => {
      const values = row.split(',');
      return {
        id: index + 1,
        name: values[0].replace('KN - ', ''),
        qLlAtendidas: parseInt(values[1]),
        tiempoACD: values[2],
        acw: values[3],
        hold: values[4],
        ring: values[5],
        tmo: values[6],
        teamId: user.teamLead!.id,
        teamLeaderId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  }, [user]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    if (!user.teamLead) {
      setError('No se encontró el equipo asociado');
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedData = parseCSVData(text);
      setData(parsedData);

      if (parsedData.length > 0) {
        sendDataToServer(parsedData);
      }
    };
    reader.readAsText(file);
  }, [user, parseCSVData, sendDataToServer]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (showingHistorical) {
      fetchHistoricalData(1, value);
    }
  }, [showingHistorical, fetchHistoricalData]);

  const handlePageChange = useCallback((newPage: number) => {
    fetchHistoricalData(newPage, searchTerm);
  }, [fetchHistoricalData, searchTerm]);

  const toggleView = useCallback(() => {
    setShowingHistorical(prev => !prev);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('No autorizado');
        }
        const userData = await response.json();
        setUser(userData);
        await fetchHistoricalData(1, '');
      } catch (err) {
        setError('Error al cargar datos de usuario');
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [fetchHistoricalData]);

  const displayData = showingHistorical ? historicalData : data;

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8 text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!user || !user.teamLead) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>TMO Métricas</CardTitle>
          <Button
            variant="outline"
            onClick={toggleView}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {showingHistorical ? 'Ver CSV Cargado' : 'Ver Histórico'}
          </Button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button 
              asChild 
              variant="outline"
              className="gap-2"
            >
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Cargar CSV
              </label>
            </Button>
            {fileName && (
              <span className="ml-2 text-sm text-gray-500">
                Archivo cargado: {fileName}
              </span>
            )}
          </div>
          <Input 
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              Cargando datos...
            </div>
          ) : displayData.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Llamadas Atendidas</TableHead>
                    <TableHead>Tiempo ACD</TableHead>
                    <TableHead>ACW</TableHead>
                    <TableHead>HOLD</TableHead>
                    <TableHead>RING</TableHead>
                    <TableHead>TMO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((item: TMOMetric) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.qLlAtendidas}</TableCell>
                      <TableCell>{item.tiempoACD}</TableCell>
                      <TableCell>{item.acw}</TableCell>
                      <TableCell>{item.hold}</TableCell>
                      <TableCell>{item.ring}</TableCell>
                      <TableCell>{item.tmo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {showingHistorical && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {showingHistorical ? 'No hay datos históricos' : 'Carga un archivo CSV para ver los datos'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TMOMetricsTable;