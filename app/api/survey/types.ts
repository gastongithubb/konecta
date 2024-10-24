// app/api/survey/types.ts
export interface SurveyData {
  moodRating: number;
  workEnvironment: number;
  personalWellbeing: number;
  workLifeBalance: number;
  stressLevel: number;
  feedback?: string | null;
}

export interface Survey extends SurveyData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyStats {
  average_mood: number;
  average_work_environment: number;
  average_wellbeing: number;
  average_balance: number;
  average_stress: number;
  total_surveys: number;
  wellbeing_rate: number;
}

export interface StatsRaw {
  average_mood: string | number;
  average_work_environment: string | number;
  average_wellbeing: string | number;
  average_balance: string | number;
  average_stress: string | number;
  total_surveys: string | number;
  wellbeing_rate: string | number;
}

export interface ProcessedSentiment {
  sentiment: 'Positivo' | 'Negativo' | 'Neutral';
  score: number;
  details: {
    positiveWords: number;
    negativeWords: number;
    textScore: number;
    numericalScore: number;
  };
}

export interface SentimentData {
  id: number;
  feedback: string | null;
  date: string;
  sentiment: string;
  score: number;
  details: {
    positiveWords: number;
    negativeWords: number;
    textScore: number;
    numericalScore: number;
  };
}

export interface SurveyTrends {
  daily: Record<string, Survey[]>;
  weekly: Record<string, Survey[]>;
}

export interface ProcessedTrend {
  date?: string;
  week?: string;
  average: number;
  count: number;
}