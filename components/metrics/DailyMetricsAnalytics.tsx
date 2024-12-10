'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Target, Users, TrendingUp, Phone, Award, ArrowUp, ArrowDown } from 'lucide-react';

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
  trends: {
    nps: number;
    csat: number;
    ces: number;
    rd: number;
  };
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  suffix = '',
  color = 'text-blue-500' 
}: any) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="flex items-baseline space-x-2">
        <div className={`text-2xl font-bold ${color}`}>
          {value}{suffix}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
    </CardContent>
  </Card>
);

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
    trends: {
      nps: 0,
      csat: 0,
      ces: 0,
      rd: 0
    }
  });

  const calculateStats = useCallback((data: DailyMetric[]) => {
    if (data.length === 0) return;

    const totalQ = data.reduce((acc, curr) => acc + curr.q, 0);
    
    // Calculate trends (comparing last two periods)
    const calculateTrend = (metric: keyof DailyMetric) => {
      if (data.length < 2) return 0;
      const latest = data[data.length - 1][metric] as number;
      const previous = data[data.length - 2][metric] as number;
      return Number(((latest - previous) / previous * 100).toFixed(1));
    };

    setStats({
      averageQ: Number((data.reduce((acc, curr) => acc + curr.q, 0) / data.length).toFixed(1)),
      averageNPS: Number((data.reduce((acc, curr) => acc + curr.nps, 0) / data.length).toFixed(1)),
      averageCSAT: Number((data.reduce((acc, curr) => acc + curr.csat, 0) / data.length).toFixed(1)),
      averageCES: Number((data.reduce((acc, curr) => acc + curr.ces, 0) / data.length).toFixed(1)),
      averageRD: Number((data.reduce((acc, curr) => acc + curr.rd, 0) / data.length).toFixed(1)),
      totalQ: totalQ,
      trends: {
        nps: calculateTrend('nps'),
        csat: calculateTrend('csat'),
        ces: calculateTrend('ces'),
        rd: calculateTrend('rd')
      }
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

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
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
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
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
        <MetricCard
          title="NPS Promedio"
          value={stats.averageNPS}
          icon={Target}
          description="Net Promoter Score del equipo"
          trend={stats.trends.nps}
          suffix="%"
          color="text-green-500"
        />
        <MetricCard
          title="CSAT Promedio"
          value={stats.averageCSAT}
          icon={Award}
          description="Customer Satisfaction promedio"
          trend={stats.trends.csat}
          suffix="%"
          color="text-blue-500"
        />
        <MetricCard
          title="CES Promedio"
          value={stats.averageCES}
          icon={TrendingUp}
          description="Customer Effort Score promedio"
          trend={stats.trends.ces}
          suffix="%"
          color="text-yellow-500"
        />
        <MetricCard
          title="RD Promedio"
          value={stats.averageRD}
          icon={Users}
          description="Resolución en primer contacto"
          trend={stats.trends.rd}
          suffix="%"
          color="text-pink-500"
        />
        <MetricCard
          title="Total Llamadas"
          value={stats.totalQ}
          icon={Phone}
          description={`Promedio: ${stats.averageQ} por agente`}
          color="text-purple-500"
        />
      </div>

      <Tabs defaultValue="line" className="space-y-4">
        <TabsList>
          <TabsTrigger value="line">Líneas de Tendencia</TabsTrigger>
          <TabsTrigger value="bar">Comparación por Barras</TabsTrigger>
        </TabsList>

        <TabsContent value="line">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Agente - Tendencias</CardTitle>
              <CardDescription>
                Visualización de tendencias en el tiempo para todas las métricas
              </CardDescription>
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
        </TabsContent>

        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Agente - Comparación</CardTitle>
              <CardDescription>
                Comparación directa de métricas entre agentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
                    <Bar dataKey="NPS" fill="#22c55e" />
                    <Bar dataKey="CSAT" fill="#3b82f6" />
                    <Bar dataKey="CES" fill="#eab308" />
                    <Bar dataKey="RD" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}