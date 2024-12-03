// types/metrics.ts
export type MetricType = 'trimestral' | 'semanal' | 'tmo' | 'nps-diario';
export type ViewType = 'upload' | 'metrics';

export interface MetricOption {
  type: MetricType;
  label: string;
  icon: React.ElementType;
}

export interface BaseMetric {
  teamLeaderId: number;
  teamId: number;
}