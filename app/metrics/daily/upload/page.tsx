// app/metrics/daily/upload/page.tsx
import DailyMetricsUpload from '@/components/metrics/DailyMetricsUpload';

export default function DailyUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cargar Métricas Diarias</h1>
      <DailyMetricsUpload />
    </div>
  );
}