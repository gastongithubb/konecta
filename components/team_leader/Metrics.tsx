'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated, type User, type UserResponse } from '@/app/lib/auth';

// Interfaces
interface DailyMetric {
  id: number;
  date: Date;
  name: string;
  q: number;
  nps: number;
  csat: number;
  ces: number;
  rd: number;
  userId: number;
  teamId: number;
}

interface WeeklyMetric {
  id: number;
  name: string;
  week: string;
  q: number;
  nps: number;
  csat: number;
  teamLeaderId: number;
  teamId: number;
}

interface TrimestralMetric {
  id: number;
  name: string;
  month: string;
  qResp: number;
  nps: number;
  sat: number;
  rd: number;
  teamLeaderId: number;
  teamId: number;
}

interface TMOMetric {
  name: string;
  qLlAtendidas: number | null;
  tiempoACD: string;
  acw: string;
  hold: string;
  ring: string;
  tmo: string;
  teamLeaderId: number;
  teamId: number;
}

interface MetricsState {
  daily: DailyMetric[];
  weekly: WeeklyMetric[];
  trimestral: TrimestralMetric[];
  tmo: TMOMetric[];
}

const MetricsDashboard: React.FC = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const [metrics, setMetrics] = useState<MetricsState>({
      daily: [],
      weekly: [],
      trimestral: [],
      tmo: []
    });
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
      daily: false,
      weekly: false,
      trimestral: false,
      tmo: false
    });
    const [userData, setUserData] = useState<{ id: number; teamId: number } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
  
    useEffect(() => {
        let isMounted = true;
      
        const fetchUserData = async () => {
          try {
            const response = await fetch('/api/auth/user', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
      
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
      
            const data = await response.json();
            
            if (isMounted && data.user) {
              if (data.user.role !== 'team_leader') {
                toast({
                  title: "Error",
                  description: "No tienes permisos para acceder a esta sección",
                  variant: "destructive",
                });
                return;
              }
      
              setUserData({
                id: data.user.id,
                teamId: data.user.teamId
              });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (isMounted) {
              toast({
                title: "Error",
                description: "Error al obtener datos del usuario",
                variant: "destructive",
              });
            }
          } finally {
            if (isMounted) {
              setIsLoaded(true);
            }
          }
        };
      
        fetchUserData();
      
        return () => {
          isMounted = false;
        };
      }, []);
      

   // Mostrar estado de carga mientras se verifica la autenticación
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
          <p className="text-muted-foreground">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no hay datos de usuario
  if (!userData) {
    return null;
  }

  const parseValue = (value: string): string | number => {
    if (/^\d+$/.test(value)) return Number(value);
    if (/^\d+\.\d+$/.test(value)) return Number(value);
    return value.trim();
  };

  const parseDate = (dateStr: string): Date => {
    return new Date(dateStr);
  };

  const processTMOData = (data: Record<string, any>[]): TMOMetric[] => {
    if (!userData?.id || !userData?.teamId) {
      console.error('User data is missing:', userData);
      return [];
    }
  
    return data
      .filter(row => row['Usuario Orion'] && row['Q Ll atendidas'])
      .map(row => ({
        name: row['Usuario Orion'].trim(),
        qLlAtendidas: parseInt(row['Q Ll atendidas']?.toString() || '0', 10),
        tiempoACD: row['Tiempo ACD']?.trim() || '0:00:00',
        acw: row['ACW']?.trim() || '0:00:00',
        hold: row['HOLD']?.trim() || '0:00:00',
        ring: row['RING']?.trim() || '0:00:00',
        tmo: row['TMO']?.trim() || '0:00:00',
        teamLeaderId: userData.id,
        teamId: userData.teamId
      }));
  };

  const processDailyData = (data: Record<string, any>[]): DailyMetric[] => {
    if (!userData) return [];

    return data.map(row => ({
      id: 0,
      date: parseDate(row['date']),
      name: row['name'],
      q: Number(row['q']),
      nps: Number(row['nps']),
      csat: Number(row['csat']),
      ces: Number(row['ces']),
      rd: Number(row['rd']),
      userId: userData.id,
      teamId: userData.teamId,
    }));
  };

  const processWeeklyData = (data: Record<string, any>[]): WeeklyMetric[] => {
    if (!userData) return [];

    return data.map(row => ({
      id: 0,
      name: row['name'],
      week: row['week'],
      q: Number(row['q']),
      nps: Number(row['nps']),
      csat: Number(row['csat']),
      teamLeaderId: userData.id,
      teamId: userData.teamId,
    }));
  };

  const processTrimestralData = (data: Record<string, any>[]): TrimestralMetric[] => {
    if (!userData) return [];

    return data.map(row => ({
      id: 0,
      name: row['name'],
      month: row['month'],
      qResp: Number(row['qResp']),
      nps: Number(row['nps']),
      sat: Number(row['sat']),
      rd: Number(row['rd']),
      teamLeaderId: userData.id,
      teamId: userData.teamId,
    }));
  };

  const uploadToDatabase = async (type: 'tmo' | 'daily', data: TMOMetric[] | DailyMetric[]) => {
    try {
      const response = await fetch(`/api/metrics/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Incluir cookies en la solicitud
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al subir datos de ${type}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error en la carga de ${type}:`, error);
      throw error;
    }
  };

  const processCSV = async (file: File, type: keyof MetricsState) => {
    if (!userData) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, [type]: true }));
    try {
      const text = await file.text();
      // Eliminar filas vacías y dividir por líneas
      const rows = text
        .split('\n')
        .filter(row => row.trim().length > 0)
        .map(row => row.split(',').map(cell => cell.trim()));
      
      // Encontrar el índice de la fila de encabezados
      const headerIndex = rows.findIndex(row => 
        type === 'tmo' ? row[0].includes('Usuario Orion') : row.some(cell => cell.includes('date') || cell.includes('name'))
      );
      
      if (headerIndex === -1) {
        throw new Error('Formato de archivo inválido: No se encontraron los encabezados');
      }

      const headers = rows[headerIndex];
      const dataRows = rows.slice(headerIndex + 1);

      const parsedData = dataRows
        .filter(row => row.length === headers.length)
        .map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = row[index]?.trim() || '';
          });
          return obj;
        });

      let processedData: any[] = [];
      
      if (type === 'tmo') {
        processedData = processTMOData(parsedData);
        if (processedData.length > 0) {
          await uploadToDatabase('tmo', processedData);
        } else {
          throw new Error('No se encontraron datos válidos en el CSV');
        }
      } else if (type === 'daily') {
        processedData = processDailyData(parsedData);
        if (processedData.length > 0) {
          await uploadToDatabase('daily', processedData);
        }
      } else if (type === 'weekly') {
        processedData = processWeeklyData(parsedData);
      } else if (type === 'trimestral') {
        processedData = processTrimestralData(parsedData);
      }

      setMetrics(prev => ({
        ...prev,
        [type]: processedData
      }));

      toast({
        title: "Éxito",
        description: `Se procesaron ${processedData.length} registros de ${type} correctamente`,
      });
    } catch (error) {
      console.error(`Error al procesar el archivo ${type}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Error al procesar el archivo ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFileUpload = (type: keyof MetricsState) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('userData before processing:', userData); // Verificar datos del usuario
      const processedData = await processCSV(file, type);
      console.log('Processed TMO data:', processedData);
      await processCSV(file, type);
    }
  };

  const calculateAverages = <T extends Record<string, any>>(data: T[], field: keyof T): number => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, curr) => {
      const value = curr[field];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    return Number((sum / data.length).toFixed(2));
  };

  const FileUploadButton: React.FC<{ type: keyof MetricsState; label: string }> = ({ type, label }) => (
    <label className={`cursor-pointer ${
      isLoading[type] ? 'bg-gray-400' : 'bg-primary'
    } text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2`}>
      <Upload className="w-4 h-4" />
      {isLoading[type] ? 'Cargando...' : label}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload(type)}
        disabled={isLoading[type]}
        className="hidden"
      />
    </label>
  );

  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Metrics Dashboard</h1>
        <div className="flex flex-wrap gap-4">
          <FileUploadButton type="daily" label="Upload Daily CSV" />
          <FileUploadButton type="weekly" label="Upload Weekly CSV" />
          <FileUploadButton type="trimestral" label="Upload Trimestral CSV" />
          <FileUploadButton type="tmo" label="Upload TMO CSV" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Metrics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>NPS: {calculateAverages(metrics.daily, 'nps')}</p>
              <p>CSAT: {calculateAverages(metrics.daily, 'csat')}</p>
              <p>CES: {calculateAverages(metrics.daily, 'ces')}</p>
              <p>RD: {calculateAverages(metrics.daily, 'rd')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Metrics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>NPS: {calculateAverages(metrics.weekly, 'nps')}</p>
              <p>CSAT: {calculateAverages(metrics.weekly, 'csat')}</p>
              <p>Q: {calculateAverages(metrics.weekly, 'q')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Trimestral Metrics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Trimestral Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>NPS: {calculateAverages(metrics.trimestral, 'nps')}</p>
              <p>SAT: {calculateAverages(metrics.trimestral, 'sat')}</p>
              <p>RD: {calculateAverages(metrics.trimestral, 'rd')}</p>
            </div>
          </CardContent>
        </Card>

        {/* TMO Metrics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>TMO Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.tmo.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Usuario: {metrics.tmo[0].name}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Q Ll atendidas</p>
                    <p className="text-lg">{metrics.tmo[0].qLlAtendidas}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tiempo ACD</p>
                    <p className="text-lg">{metrics.tmo[0].tiempoACD}</p>
                  </div>
                  <div>
                    <p className="font-medium">ACW</p>
                    <p className="text-lg">{metrics.tmo[0].acw}</p>
                  </div>
                  <div>
                    <p className="font-medium">HOLD/RING</p>
                    <p className="text-lg">{metrics.tmo[0].hold}/{metrics.tmo[0].ring}</p>
                  </div>
                  <div>
                    <p className="font-medium">TMO</p>
                    <p className="text-lg">{metrics.tmo[0].tmo}</p>
                  </div>
                  </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay datos TMO disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Metrics Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.daily}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="nps" 
                stroke={theme === 'dark' ? '#8884d8' : '#4338ca'} 
              />
              <Line 
                type="monotone" 
                dataKey="csat" 
                stroke={theme === 'dark' ? '#82ca9d' : '#059669'} 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;