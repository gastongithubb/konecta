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