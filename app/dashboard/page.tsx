// app/dashboard/page.tsx
import { getSession } from '@/app/lib/auth.server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';



export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  switch (session.role) { // Usar role en lugar de userRole
    case 'agent':
      redirect('/dashboard/user');
    case 'leader':
      redirect('/dashboard/team_leader');
    case 'manager':
      redirect('/dashboard/manager');
    default:
      redirect('/unauthorized');
  }
}