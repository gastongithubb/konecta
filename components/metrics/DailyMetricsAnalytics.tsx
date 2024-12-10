'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Target, Users, TrendingUp, Phone, Award } from 'lucide-react';

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

interface MetricsStats {
  averageQ: number;
  averageNPS: number;
  averageCSAT: number;
  averageCES: number;
  averageRD: number;
  totalQ: number;
}

export default function DailyMetricsAnalytics() {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MetricsStats>({
    averageQ: 0,
    averageNPS: 0,
    averageCSAT: 0,
    averageCES: 0,
    averageRD: 0,
    totalQ: 0,
  });

  const calculateStats = useCallback((data: DailyMetric[]) => {
    if (data.length === 0) return;

    const totalQ = data.reduce((acc, curr) => acc + curr.q, 0);
    
    setStats({
      averageQ: Number((data.reduce((acc, curr) => acc + curr.q, 0) / data.length).toFixed(1)),
      averageNPS: Number((data.reduce((acc, curr) => acc + curr.nps, 0) / data.length).toFixed(1)),
      averageCSAT: Number((data.reduce((acc, curr) => acc + curr.csat, 0) / data.length).toFixed(1)),
      averageCES: Number((data.reduce((acc, curr) => acc + curr.ces, 0) / data.length).toFixed(1)),
      averageRD: Number((data.reduce((acc, curr) => acc + curr.rd, 0) / data.length).toFixed(1)),
      totalQ: totalQ,
    });
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/metrics/daily-metrics', {
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
  }, [calculateStats]);

  const StatCard = ({ title, value, icon: Icon, description, suffix = '' }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{suffix}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
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

  const chartData = metrics.map(metric => ({
    name: metric.name,
    NPS: metric.nps,
    CSAT: metric.csat,
    CES: metric.ces,
    RD: metric.rd,
    Q: metric.q
  }));

  return (
    <div className="space-y-4 p-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="NPS Promedio"
          value={stats.averageNPS}
          icon={Target}
          description="Net Promoter Score del equipo"
          suffix="%"
        />
        <StatCard
          title="CSAT Promedio"
          value={stats.averageCSAT}
          icon={Award}
          description="Customer Satisfaction promedio"
          suffix="%"
        />
        <StatCard
          title="CES Promedio"
          value={stats.averageCES}
          icon={TrendingUp}
          description="Customer Effort Score promedio"
          suffix="%"
        />
        <StatCard
          title="RD Promedio"
          value={stats.averageRD}
          icon={Users}
          description="Resolución en primer contacto"
          suffix="%"
        />
        <StatCard
          title="Total Llamadas"
          value={stats.totalQ}
          icon={Phone}
          description={`Promedio: ${stats.averageQ} por agente`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas por Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: any) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="NPS" 
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="CSAT" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="CES" 
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ fill: '#eab308' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="RD" 
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}