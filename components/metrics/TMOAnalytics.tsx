'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock, TrendingUp, Users, Timer, PhoneCall, ArrowUp, ArrowDown, Calendar, Filter } from 'lucide-react';

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
  timeDistribution: {
    acd: number;
    acw: number;
    hold: number;
    ring: number;
  };
  trends: {
    tmo: number;
    calls: number;
  };
  efficiency: {
    productiveTime: number;
    waitTime: number;
  };
}

interface TooltipFormatterParams {
  value: number;
  name: string;
  entry?: any;
  dataKey?: string;
}

const COLORS = {
  acd: '#22c55e',
  acw: '#3b82f6',
  hold: '#eab308',
  ring: '#ec4899',
  tmo: '#8b5cf6',
  calls: '#06b6d4'
};

const TIME_PERIODS = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '14d', label: 'Últimos 14 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'all', label: 'Todo el período' }
];

// ... (código anterior se mantiene igual)

const DetailCard = ({
  title,
  value,
  secondaryValue,
  icon: Icon,
  description,
  trend,
  suffix = '',
  color = 'text-blue-500',
  footer
}: any) => (
  <Card className="hover:shadow-lg transition-all duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="flex items-baseline justify-between">
        <div>
          <div className={`text-2xl font-bold ${color}`}>
            {value}{suffix}
          </div>
          {secondaryValue && (
            <div className="text-sm text-muted-foreground">
              {secondaryValue}
            </div>
          )}
        </div>
        {trend !== undefined && (
          <Badge variant={trend <= 0 ? "default" : "destructive"} className="flex items-center gap-1">
            {trend <= 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {description}
      </p>
    </CardContent>
    {footer && (
      <CardFooter className="pt-2 border-t">
        <p className="text-xs text-muted-foreground w-full">
          {footer}
        </p>
      </CardFooter>
    )}
  </Card>
);


const CustomTooltip = ({
  active,
  payload,
  label,
  formatter
}: {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
  formatter: (value: number, name: string) => string;
}) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.name}: </span>
          <span className="font-medium">{formatter(item.value, item.name)}</span>
        </div>
      ))}
    </div>
  );
};

export default function TMOAnalytics() {
  const [metrics, setMetrics] = useState<TMOMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('7d');
  const [stats, setStats] = useState<TMOStats>({
    averageTMO: '00:00:00',
    totalCalls: 0,
    improvement: 0,
    timeDistribution: {
      acd: 0,
      acw: 0,
      hold: 0,
      ring: 0
    },
    trends: {
      tmo: 0,
      calls: 0
    },
    efficiency: {
      productiveTime: 0,
      waitTime: 0
    }
  });

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

  const calculateStats = useCallback((data: TMOMetric[]) => {
    if (data.length === 0) return;

    const totalTMOSeconds = data.reduce((acc, curr) => acc + timeToSeconds(curr.tmo), 0);
    const averageTMOSeconds = Math.round(totalTMOSeconds / data.length);
    const totalCalls = data.reduce((acc, curr) => acc + curr.qLlAtendidas, 0);

    // Calcular distribución de tiempos y eficiencia
    const lastMetric = data[data.length - 1];
    const acdTime = timeToSeconds(lastMetric.tiempoACD);
    const acwTime = timeToSeconds(lastMetric.acw);
    const holdTime = timeToSeconds(lastMetric.hold);
    const ringTime = timeToSeconds(lastMetric.ring);
    const totalTime = acdTime + acwTime + holdTime + ringTime;

    const productiveTime = (acdTime + acwTime) / totalTime * 100;
    const waitTime = (holdTime + ringTime) / totalTime * 100;

    // Calcular tendencias
    const calculateTrend = (current: number, previous: number) =>
      ((current - previous) / previous) * 100;

    const tmoTrend = calculateTrend(
      timeToSeconds(data[data.length - 1].tmo),
      timeToSeconds(data[0].tmo)
    );

    const callsTrend = calculateTrend(
      data[data.length - 1].qLlAtendidas,
      data[0].qLlAtendidas
    );

    setStats({
      averageTMO: secondsToTime(averageTMOSeconds),
      totalCalls,
      improvement: -tmoTrend,
      timeDistribution: {
        acd: (acdTime / totalTime) * 100,
        acw: (acwTime / totalTime) * 100,
        hold: (holdTime / totalTime) * 100,
        ring: (ringTime / totalTime) * 100
      },
      trends: {
        tmo: tmoTrend,
        calls: callsTrend
      },
      efficiency: {
        productiveTime,
        waitTime
      }
    });
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // En una implementación real, pasaríamos el timePeriod como parámetro
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
  }, [calculateStats, timePeriod]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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

  const timeDistributionData = [
    { name: 'Tiempo ACD', value: stats.timeDistribution.acd, color: COLORS.acd },
    { name: 'ACW', value: stats.timeDistribution.acw, color: COLORS.acw },
    { name: 'Hold', value: stats.timeDistribution.hold, color: COLORS.hold },
    { name: 'Ring', value: stats.timeDistribution.ring, color: COLORS.ring }
  ];

  const detailedData = metrics.map(metric => ({
    name: metric.name,
    tmo: timeToSeconds(metric.tmo),
    acd: timeToSeconds(metric.tiempoACD),
    acw: timeToSeconds(metric.acw),
    hold: timeToSeconds(metric.hold),
    ring: timeToSeconds(metric.ring),
    calls: metric.qLlAtendidas
  }));

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Análisis de TMO</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona período" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetailCard
          title="TMO Promedio"
          value={stats.averageTMO}
          icon={Clock}
          description="Tiempo medio operativo general"
          trend={stats.trends.tmo}
          color="text-purple-500"
          footer={`Tiempo productivo: ${stats.efficiency.productiveTime.toFixed(1)}%`}
        />
        <DetailCard
          title="Total Llamadas"
          value={stats.totalCalls.toLocaleString()}
          secondaryValue={`${(stats.totalCalls / metrics.length).toFixed(1)} promedio diario`}
          icon={PhoneCall}
          description="Llamadas atendidas por el equipo"
          trend={stats.trends.calls}
          color="text-cyan-500"
        />
        <DetailCard
          title="Mejora en TMO"
          value={`${Math.abs(stats.improvement).toFixed(1)}%`}
          icon={TrendingUp}
          description="Cambio desde la primera medición"
          color="text-emerald-500"
          footer={stats.improvement <= 0 ? "Tendencia positiva ↓" : "Área de oportunidad ↑"}
        />
        <DetailCard
          title="Eficiencia"
          value={`${stats.efficiency.productiveTime.toFixed(1)}%`}
          secondaryValue={`${stats.efficiency.waitTime.toFixed(1)}% tiempo en espera`}
          icon={Timer}
          description="Tiempo productivo vs tiempo en espera"
          color="text-amber-500"
        />
      </div>

      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="trend">Tendencia TMO</TabsTrigger>
          <TabsTrigger value="distribution">Distribución de Tiempo</TabsTrigger>
          <TabsTrigger value="detailed">Detalle por Componente</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de TMO por Agente</CardTitle>
              <CardDescription>Evolución del tiempo medio operativo y llamadas atendidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detailedData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
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
                      yAxisId="tmo"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickFormatter={secondsToTime}
                      label={{ value: 'TMO', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis
                      yAxisId="calls"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      label={{ value: 'Llamadas', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip
                      content={<CustomTooltip
                        formatter={(value: number, name: string) =>
                          name === "TMO" ? secondsToTime(value) : value.toString()
                        }
                      />}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      name="TMO"
                      dataKey="tmo"
                      stroke={COLORS.tmo}
                      strokeWidth={2}
                      dot={{ fill: COLORS.tmo }}
                      yAxisId="tmo"
                    />
                    <Line
                      type="monotone"
                      name="Llamadas"
                      dataKey="calls"
                      stroke={COLORS.calls}
                      strokeWidth={2}
                      dot={{ fill: COLORS.calls }}
                      yAxisId="calls"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Tiempo de Llamada</CardTitle>
              <CardDescription>Desglose de componentes del TMO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={150}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      >
                        {timeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />}
                      />
                      <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {timeDistributionData.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">{item.value.toFixed(1)}%</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Componentes del TMO por Agente</CardTitle>
                  <CardDescription>Desglose detallado de tiempos</CardDescription>
                </div>
                <Select defaultValue="stack">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de visualización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stack">Vista Apilada</SelectItem>
                    <SelectItem value="group">Vista Agrupada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={detailedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
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
                      tickFormatter={secondsToTime}
                    />
                    <Tooltip
                      content={<CustomTooltip formatter={secondsToTime} />}
                    />
                    <Legend />
                    <Bar
                      dataKey="acd"
                      name="Tiempo ACD"
                      fill={COLORS.acd}
                      stackId="a"
                    />
                    <Bar
                      dataKey="acw"
                      name="ACW"
                      fill={COLORS.acw}
                      stackId="a"
                    />
                    <Bar
                      dataKey="hold"
                      name="Hold"
                      fill={COLORS.hold}
                      stackId="a"
                    />
                    <Bar
                      dataKey="ring"
                      name="Ring"
                      fill={COLORS.ring}
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(COLORS).slice(0, 4).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-muted-foreground capitalize">
                      {key === 'acd' ? 'Tiempo ACD' : key.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}