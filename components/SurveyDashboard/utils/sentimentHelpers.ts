// components/SurveyDashboard/utils/sentimentHelpers.ts
import type { SentimentData } from '../types';

interface ProcessedSentiment {
  percentages: {
    positive: string;
    negative: string;
    neutral: string;
  };
  recentSentiments: Array<{
    feedback: string;
    sentiment: string;
    date: string;
  }>;
}

export const processSentimentData = (data: SentimentData): ProcessedSentiment => {
  const total = data.positive + data.negative + data.neutral;
  
  const calculatePercentage = (value: number): string => {
    return ((value / total) * 100).toFixed(1);
  };

  return {
    percentages: {
      positive: calculatePercentage(data.positive),
      negative: calculatePercentage(data.negative),
      neutral: calculatePercentage(data.neutral)
    },
    recentSentiments: data.recentSentiments
  };
};

export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment.toLowerCase()) {
    case 'positivo':
      return 'text-green-600 bg-green-50';
    case 'negativo':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};