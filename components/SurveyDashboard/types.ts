// components/SurveyDashboard/types.ts
export interface SurveyStats {
  average_mood: number;
  average_work_environment: number;
  average_wellbeing: number;
  average_balance: number;
  average_stress: number;
  total_surveys: number;
  wellbeing_rate: number;
}

export interface WordCloudData {
  text: string;
  value: number;
}

export interface ChartDataPoint {
  date: string;
  moodRating: number;
  workEnvironment: number;
  personalWellbeing: number;
  workLifeBalance: number;
  stressLevel: number;
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  recentSentiments: Array<{
    feedback: string;
    sentiment: string;
    date: string;
  }>;
}