// components/SurveyDashboard/index.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from './MetricsCard';
import { WordCloud } from './WordCloud';
import { MetricsChart } from './MetricsChart';
import { SentimentAnalysis } from './SentimentAnalysis';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface SurveyStats {
  average_mood: number;
  average_work_environment: number;
  average_wellbeing: number;
  average_balance: number;
  average_stress: number;
  total_surveys: number;
  wellbeing_rate: number;
}

interface WordCloudData {
  text: string;
  value: number;
}

interface ChartDataPoint {
  date: string;
  moodRating: number;
  workEnvironment: number;
  personalWellbeing: number;
  workLifeBalance: number;
  stressLevel: number;
}

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  recentSentiments: Array<{
    feedback: string;
    sentiment: string;
    date: string;
  }>;
}

export const SurveyDashboard: React.FC = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/survey', {
          headers: {
            'x-user-role': 'manager'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        
        if (data.success) {
          // Establecer estadísticas generales
          setStats(data.data.stats);
          
          // Transformar datos para el gráfico
          const transformedChartData = data.data.surveys.map((survey: any) => ({
            date: new Date(survey.createdAt).toLocaleDateString(),
            moodRating: survey.moodRating,
            workEnvironment: survey.workEnvironment,
            personalWellbeing: survey.personalWellbeing,
            workLifeBalance: survey.workLifeBalance,
            stressLevel: survey.stressLevel
          }));
          setChartData(transformedChartData);

          // Transformar datos para el análisis de sentimientos
          const transformedSentimentData: SentimentData = {
            positive: data.data.sentimentAnalysis.counts.Positivo,
            negative: data.data.sentimentAnalysis.counts.Negativo,
            neutral: data.data.sentimentAnalysis.counts.Neutral,
            recentSentiments: data.data.sentimentAnalysis.recent.map((item: any) => ({
              feedback: item.feedback || '',
              sentiment: item.sentiment,
              date: new Date(item.date).toLocaleDateString()
            }))
          };
          setSentimentData(transformedSentimentData);
          
          // Notificar éxito
          toast({
            title: "Dashboard actualizado",
            description: "Los datos se han cargado correctamente",
            duration: 3000,
          });
        } else {
          throw new Error(data.error || 'Error al procesar los datos');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard de Bienestar</h1>
          <div className="text-sm text-gray-500">
            Total de encuestas: {stats?.total_surveys || 0}
          </div>
        </div>
        
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Estado de ánimo promedio"
            value={stats?.average_mood || 0}
            description="Escala de 1 a 5"
            suffix=""
          />
          <MetricsCard
            title="Ambiente laboral"
            value={stats?.average_work_environment || 0}
            description="Satisfacción general"
            suffix=""
          />
          <MetricsCard
            title="Nivel de estrés"
            value={stats?.average_stress || 0}
            description="Menor es mejor"
            suffix=""
          />
          <MetricsCard
            title="Balance vida-trabajo"
            value={stats?.average_balance || 0}
            description="Percepción general"
            suffix=""
          />
        </div>

        {/* Gráficos y análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Gráfico de tendencias */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendencias en el tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsChart data={chartData} />
            </CardContent>
          </Card>

          {/* Análisis de sentimientos */}
          {sentimentData && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Análisis de sentimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentAnalysis data={sentimentData} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Nube de palabras */}
        {wordCloudData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Términos más mencionados</CardTitle>
            </CardHeader>
            <CardContent>
              <WordCloud words={wordCloudData} />
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </>
  );
};

export default SurveyDashboard;