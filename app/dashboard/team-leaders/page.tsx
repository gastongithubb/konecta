import React from 'react';
import { PrismaClient } from '@prisma/client';
import TeamLeaderList from '@/components/admin/TeamLeaderList';
import TeamLeaderForm from '@/components/admin/TeamLeaderForm';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { verifyAccessToken } from '@/app/lib/auth.server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/user';

const prisma = new PrismaClient();

// Agregamos la configuración de metadatos
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

    return (
      <DashboardBase userRole={decodedToken.role as UserRole}>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Gestión de Lideres</h1>
          <TeamLeaderList teamLeaders={teamLeaders} />
          <TeamLeaderForm />
        </div>
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error in TeamLeadersPage:', error);
    redirect('/login');
  }
}