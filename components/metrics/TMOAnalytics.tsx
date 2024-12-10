'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface TMOMetric {
  id: number;
  name: string;
  qLlAtendidas: number;
  tiempoACD: string;
  acw: string;
  hold: string;
  ring: string;
  tmo: string;
  createdAt: string;
  team: {
    name: string;
  } | null;
}

interface TMOStats {
  averageTMO: string;
  totalCalls: number;
  improvement: number;
}

export default function TMOAnalytics() {
  const [metrics, setMetrics] = useState<TMOMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TMOStats>({
    averageTMO: '00:00:00',
    totalCalls: 0,
    improvement: 0,
  });

  // Mover las funciones utilitarias fuera del componente si no usan props o state
  const timeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const secondsToTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Usar useCallback para la función calculateStats
  const calculateStats = useCallback((data: TMOMetric[]) => {
    if (data.length === 0) return;

    const totalTMOSeconds = data.reduce((acc, curr) => acc + timeToSeconds(curr.tmo), 0);
    const averageTMOSeconds = Math.round(totalTMOSeconds / data.length);
    const totalCalls = data.reduce((acc, curr) => acc + curr.qLlAtendidas, 0);
    const firstTMO = timeToSeconds(data[0].tmo);
    const lastTMO = timeToSeconds(data[data.length - 1].tmo);
    const improvement = ((firstTMO - lastTMO) / firstTMO) * 100;

    setStats({
      averageTMO: secondsToTime(averageTMOSeconds),
      totalCalls,
      improvement,
    });
  }, []);  // No tiene dependencias porque timeToSeconds y secondsToTime son funciones estáticas

  // Mover prepareChartData fuera del efecto
  const prepareChartData = useCallback((data: TMOMetric[]) => {
    return data.map(metric => ({
      name: metric.name,
      tmo: timeToSeconds(metric.tmo),
      calls: metric.qLlAtendidas,
    }));
  }, []);  // depende de timeToSeconds que es estática

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/metrics/tmo-metrics', {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al obtener los datos');
        }

        setMetrics(data.metrics);
        calculateStats(data.metrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [calculateStats]);  // Ahora incluimos calculateStats como dependencia

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-4 w-[200px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = prepareChartData(metrics);

  return (
    <div className="space-y-4 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="TMO Promedio del Equipo"
          value={stats.averageTMO}
          icon={Clock}
          description="Tiempo medio operativo general"
        />
        <StatCard
          title="Total de Llamadas"
          value={stats.totalCalls}
          icon={Users}
          description="Llamadas atendidas por el equipo"
        />
        <StatCard
          title="Mejora en TMO"
          value={`${Math.abs(stats.improvement).toFixed(1)}%`}
          icon={TrendingUp}
          description={stats.improvement > 0 ? "Mejora desde la primera medición" : "Incremento desde la primera medición"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia de TMO por Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value) => secondsToTime(value)}
                />
                <Tooltip
                  formatter={(value: any) => secondsToTime(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tmo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}