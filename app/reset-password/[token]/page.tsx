// app/reset-password/[token]/page.tsx
import ResetPassword from '@/components/generales/ResetPassword';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPassword token={params.token} />;
}