// components/SurveyDashboard/components/MetricsGrid.tsx
import { MetricsCard } from './MetricsCard';
import type { SurveyStats } from '../types';

interface MetricsGridProps {
  stats: SurveyStats;
}

export const MetricsGrid = ({ stats }: MetricsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricsCard
      title="Estado de ánimo"
      value={stats.average_mood}
      description="Promedio general"
    />
    <MetricsCard
      title="Ambiente laboral"
      value={stats.average_work_environment}
      description="Satisfacción general"
    />
    <MetricsCard
      title="Nivel de estrés"
      value={stats.average_stress}
      description="Menor es mejor"
    />
    <MetricsCard
      title="Balance vida-trabajo"
      value={stats.average_balance}
      description="Percepción general"
    />
  </div>
);