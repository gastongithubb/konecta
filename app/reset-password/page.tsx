import { Suspense } from 'react';
import ResetPassword from '@/components/generales/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}

// Añadir esta línea para forzar el renderizado dinámico
export const dynamic = 'force-dynamic';