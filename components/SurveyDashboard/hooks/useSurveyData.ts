// components/SurveyDashboard/hooks/useSurveyData.ts
'use client';

import { useState, useEffect } from 'react';
import type { SurveyDashboardData } from '../types';

export function useSurveyData() {
  const [data, setData] = useState<SurveyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/survey', {
          headers: { 'x-user-role': 'manager' }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar datos');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Transformar los datos al formato correcto
          const transformedData: SurveyDashboardData = {
            stats: result.data.stats,
            chartData: result.data.surveys.map((survey: any) => ({
              date: survey.createdAt,
              moodRating: survey.moodRating,
              workEnvironment: survey.workEnvironment,
              personalWellbeing: survey.personalWellbeing,
              workLifeBalance: survey.workLifeBalance,
              stressLevel: survey.stressLevel
            })),
            sentimentData: {
              positive: result.data.sentimentAnalysis.counts.Positivo,
              negative: result.data.sentimentAnalysis.counts.Negativo,
              neutral: result.data.sentimentAnalysis.counts.Neutral,
              recentSentiments: result.data.sentimentAnalysis.recent.map((item: any) => ({
                feedback: item.feedback,
                sentiment: item.sentiment,
                date: item.date
              }))
            }
          };
          
          setData(transformedData);
        } else {
          throw new Error(result.error || 'Error al procesar los datos');
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
}