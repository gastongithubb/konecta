// app/dashboard/team-leaders/page.tsx
import { PrismaClient } from '@prisma/client';
import TeamLeaderList from '@/components/admin/TeamLeaderList';
import TeamLeaderForm from '@/components/admin/TeamLeaderForm';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/app/lib/auth.server';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function TeamLeadersPage() {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      redirect('/login');
    }

    const decodedToken = await verifyAccessToken(token);
    
    if (!decodedToken) {
      redirect('/login');
    }

    if (decodedToken.role !== 'manager') {
      redirect('/dashboard');
    }

    const teamLeaders = await prisma.user.findMany({
      where: { role: 'team_leader' },
      select: { 
        id: true, 
        name: true, 
        email: true 
      },
    });

    // Asegúrate de que los IDs sean números
    const formattedTeamLeaders = teamLeaders.map(leader => ({
      ...leader,
      id: Number(leader.id)
    }));

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gestión de Líderes</h1>
        <TeamLeaderList teamLeaders={formattedTeamLeaders} />
        <TeamLeaderForm />
      </div>
    );
  } catch (error) {
    console.error('Error in TeamLeadersPage:', error);
    redirect('/login');
  }
}