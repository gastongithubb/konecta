import { cookies } from 'next/headers';
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import AgentDashboardClient from './AgentDashboardClient';
import { redirect } from 'next/navigation';

export default async function AgentDashboardPage() {
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
      throw new Error('User data not found');
    }

    return <AgentDashboardClient userData={userData} />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}