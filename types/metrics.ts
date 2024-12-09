// types/metrics.ts
export type MetricType = 'tmo' | 'daily' | 'weekly' | 'trimestral';

export interface MetricsState {
  tmo: TMOMetric[];
  daily: DailyMetric[];
  weekly: WeeklyMetric[];
  trimestral: TrimestralMetric[];
}

export interface FileUploadState {
  type: MetricType | '';
  file: File | null;
}

export interface MetricThreshold {
  metric: string;
  min: number;
  max: number;
}

export interface BasePaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BaseMetricResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface MetricError {
  error: string;
  details?: string;
  code?: string;
}

export interface TMOMetric {
  id?: number;
  name: string;
  qLlAtendidas: number;
  tiempoACD: string;
  acw: string;
  hold: string;
  ring: string;
  tmo: string;
  teamId: number;
  teamLeaderId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyMetric {
  id?: number;
  name: string;
  q: number;
  nps: number;
  csat: number;
  ces: number;
  rd: number;
  teamId: number;
  teamLeaderId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WeeklyMetric {
  id?: number;
  name: string;
  week: string;
  q: number;
  nps: number;
  csat: number;
  teamId: number;
  teamLeaderId: number;
  createdAt?: Date;
}

export interface TrimestralMetric {
  id?: number;
  name: string;
  month: string;
  qResp: number;
  nps: number;
  sat: number;
  rd: number;
  teamId: number;
  teamLeaderId: number;
  createdAt?: Date;
}