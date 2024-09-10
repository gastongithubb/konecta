// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.sub) {
      redirect('/login');
    }

    const userData = await getUserData(decoded.sub);

    switch (userData.role) {
      case 'agent':
        redirect('/dashboard/agent');
      case 'leader':
        redirect('/dashboard/leader');
      case 'manager':
        redirect('/dashboard/manager');
      default:
        redirect('/unauthorized');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}