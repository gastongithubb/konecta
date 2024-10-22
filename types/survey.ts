// types/survey.ts
export interface SurveyStats {
    average_rating: number;
    total_surveys: number;
    satisfaction_rate: number;
  }
  
  export interface SurveyData {
    moodRating: number;
    workEnvironment: number;
    personalWellbeing: number;
    workLifeBalance: number;
    stressLevel: number;
    feedback: string;
  }
