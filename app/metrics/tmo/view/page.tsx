// app/metrics/tmo/view/page.tsx
import TMOUpload from '@/components/metrics/TMOUploadComponent';

export default function TMOViewPage() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Visualizar Métricas TMO</h1>
        <TMOUpload hideUpload={true} />
      </div>
    );
}