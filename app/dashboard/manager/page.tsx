import React from 'react';
import { redirect } from 'next/navigation';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { verifyAccessToken } from '@/app/lib/auth';
import { getUserData } from '@/app/lib/auth.server'
import { cookies } from 'next/headers';
import TeamLeaderManagement from '@/components/admin/TeamLeaderManagement';

export default async function DashboardManager() {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      redirect('/login');
    }

    const decoded = await verifyAccessToken(token);
    
    if (!decoded || !decoded.sub) {
      redirect('/login');
    }

    const user = await getUserData(decoded.sub);

    const userRole = user.role === 'user' ? 'user' : 
                     user.role === 'manager' ? 'manager' : 
                     user.role === 'team_leader' ? 'team_leader' : 
                     'user';

    return (
      <DashboardBase userRole={userRole}>
        <h1 className="text-3xl font-bold mb-6">Bienvenid@, {user.name}</h1>
        {userRole === 'manager' && <TeamLeaderManagement />}
        {/* Otro contenido del dashboard específico para cada rol */}
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}