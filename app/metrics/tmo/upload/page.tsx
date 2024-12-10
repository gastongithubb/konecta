// app/metrics/tmo/upload/page.tsx
import TMOUpload from '@/components/metrics/TMOUploadComponent';

export default function TMOUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cargar Métricas TMO</h1>
      <TMOUpload />
    </div>
  );
}