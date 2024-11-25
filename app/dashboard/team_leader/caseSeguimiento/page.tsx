// src/app/case-tracking/page.tsx
import TrackingList from '@/components/generales/TrackingList';

export default function CaseTrackingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Sistema de Seguimiento de Casos a derivar o finalizar
      </h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <TrackingList />
      </div>
    </div>
  );
}