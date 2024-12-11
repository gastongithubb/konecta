// app/login/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/app/lib/auth.server';

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (token) {
    try {
      const decoded = await verifyAccessToken(token);
      if (decoded) {
        redirect(`/dashboard/${decoded.role}`);
      }
    } catch (error) {
      // Token inválido, continuar con el layout de login
    }
  }

  return (
    <>
      {children}
    </>
  );
}