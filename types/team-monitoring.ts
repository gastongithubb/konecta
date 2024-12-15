// types/team-monitoring.ts
export type CallType = 
  | 'Primera llamada'
  | 'Segunda llamada'
  | 'Tercer llamada'
  | 'Cuarta llamada'
  | 'Quinta llamada'
  | 'Sexta llamada'
  | 'Septima llamada'
  | 'Octava llamada'
  | 'Novena llamada'
  | 'Ultima llamada'
  | 'Llamada nº10';

export type WeekData = {
  callType: CallType;
  audio?: string;
  score?: number;
};

export type TeamMember = {
  id: number;
  email: string;
  name: string;
  week1?: WeekData;
  week2?: WeekData;
  week3?: WeekData;
};

export type WeekInfo = {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type WeekFormData = {
  label: string;
  startDate: string;
  endDate: string;
  weekNumber: number;
};

export type WeekConfigurationInput = WeekFormData & {
  isActive: boolean;
};