// components/SurveyDashboard/index.tsx
'use client';

import { MetricsGrid } from './components/MetricsGrid';
import { TrendsChart } from './components/TrendsChart';
import { SentimentPanel } from './components/SentimentPanel';
import { useSurveyData } from './hooks/useSurveyData';

export const SurveyDashboard = () => {
  const { data, isLoading, error } = useSurveyData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Encuesta Bienestar</h1>
        <span className="text-sm text-gray-500">
          Total de encuestas: {data.stats.total_surveys}
        </span>
      </div>

      <MetricsGrid stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendsChart data={data.chartData} />
        </div>
        <div className="lg:col-span-1">
          <SentimentPanel data={data.sentimentData} />
        </div>
      </div>
    </div>
  );
};

export default SurveyDashboard;