// components/SurveyDashboard/hooks/useSurveyData.ts
import { useState, useEffect } from 'react';
import type { SurveyStats, ChartDataPoint, SentimentData } from '../types';

interface SurveyDashboardData {
  stats: SurveyStats;
  chartData: ChartDataPoint[];
  sentimentData: SentimentData;
}

export const useSurveyData = () => {
  const [data, setData] = useState<SurveyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/survey', {
          headers: { 'x-user-role': 'manager' }
        });
        
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};