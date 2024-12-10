// app/metrics/daily/view/page.tsx
import DailyMetricsUpload from '@/components/metrics/DailyMetricsUpload';

export default function DailyViewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Visualizar Métricas Diarias</h1>
      <DailyMetricsUpload hideUpload={true} />
    </div>
  );
}