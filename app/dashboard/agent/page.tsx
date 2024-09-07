import React from 'react';
import { redirect } from 'next/navigation';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { getUserData } from '@/lib/auth';

export default async function AgentDashboard() {
  try {
    const user = await getUserData();

    return (
      <DashboardBase userRole="user">
        <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
        {/* Resto del contenido del dashboard */}
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}