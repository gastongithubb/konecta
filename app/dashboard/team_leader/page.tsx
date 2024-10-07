import { cookies } from 'next/headers';
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import LeaderDashboardClient from './LeaderDashboardClient';
import { redirect } from 'next/navigation';

export default async function LeaderDashboardPage() {
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

    if (!userData) {
      redirect('/login');
    }

    return <LeaderDashboardClient userData={userData} />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}