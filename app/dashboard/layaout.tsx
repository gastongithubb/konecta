// app/dashboard/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/app/lib/auth.server';
import NavbarAdmin from '@/components/generales/NavBarAdmin';
export const dynamic = 'force-dynamic';


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      redirect('/login');
    }

    return (
      <>
        <NavbarAdmin shouldRedirect={false} />
        {children}
      </>
    );
  } catch (error) {
    console.error('Error verifying token:', error);
    redirect('/login');
  }
}