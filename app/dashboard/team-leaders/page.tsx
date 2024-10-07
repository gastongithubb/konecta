import React from 'react';
import { PrismaClient } from '@prisma/client';
import TeamLeaderList from '@/components/admin/TeamLeaderList';
import TeamLeaderForm from '@/components/admin/TeamLeaderForm';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function TeamLeadersPage() {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const decoded = await verifyAccessToken(token);
    
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token');
    }

    const user = await getUserData(decoded.sub);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'manager') {
      redirect('/dashboard');
    }

    const teamLeaders = await prisma.user.findMany({
      where: { role: 'team_leader' },
      select: { id: true, name: true, email: true },
    });

    return (
      <DashboardBase userRole={user.role}>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Gestión de Lideres</h1>
          <TeamLeaderList teamLeaders={teamLeaders} />
          <TeamLeaderForm />
        </div>
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error fetching team leaders:', error);
    redirect('/login');
  }
}