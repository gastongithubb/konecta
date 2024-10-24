// components/SurveyDashboard/utils/chartHelpers.ts
import type { ChartDataPoint } from '../types';

export const formatChartData = (data: ChartDataPoint[]) => {
  return data.map(point => ({
    ...point,
    date: new Date(point.date).toISOString(),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateMovingAverage = (data: ChartDataPoint[], days: number = 7) => {
  return data.map((point, index) => {
    const startIndex = Math.max(0, index - days + 1);
    const values = data.slice(startIndex, index + 1);
    const average = values.reduce((sum, p) => sum + p.moodRating, 0) / values.length;

    return {
      ...point,
      movingAverage: Number(average.toFixed(2))
    };
  });
};
