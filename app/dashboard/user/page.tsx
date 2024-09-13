// app/dashboard/agent/page.tsx
import { cookies } from 'next/headers';
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import AgentDashboardClient from './AgentDashboardClient';
import RootLayout from '@/app/layout';

export default async function AgentDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.sub) {
      return { redirect: { destination: '/login', permanent: false } };
    }

    const userData = await getUserData(decoded.sub);

    return <RootLayout><AgentDashboardClient userData={userData} /></RootLayout>;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { redirect: { destination: '/login', permanent: false } };
  }
}