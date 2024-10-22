// app/api/survey/types.ts
export interface SurveyStats {
    average_mood: number;
    average_work_environment: number;
    average_wellbeing: number;
    average_balance: number;
    average_stress: number;
    total_surveys: number;
    wellbeing_rate: number;
    
  }
  
  export interface SentimentAnalysis {
    score: number;
    sentiment: 'Positivo' | 'Negativo' | 'Neutral';
    details: {
      positiveWords: number;
      negativeWords: number;
      textScore: number;
      numericalScore: number;
    };
  }

  export interface SurveyData {
  moodRating: number;
  workEnvironment: number;
  personalWellbeing: number;
  workLifeBalance: number;
  stressLevel: number;
  feedback: string | null;
}