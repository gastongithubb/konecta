// app/metrics/tmo/analytics/page.tsx
import TMOAnalytics from '@/components/metrics/TMOAnalytics';

export default function TMOAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Análisis de Métricas TMO</h1>
      <TMOAnalytics />
    </div>
  );
}