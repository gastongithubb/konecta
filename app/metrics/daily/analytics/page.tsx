// app/metrics/daily/analytics/page.tsx
import DailyMetricsAnalytics from '@/components/metrics/DailyMetricsAnalytics';

export default function DailyAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Análisis de Métricas Diarias</h1>
      <DailyMetricsAnalytics />
    </div>
  );
}