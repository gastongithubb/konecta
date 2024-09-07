import React from 'react';
import { redirect } from 'next/navigation';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { getUserData } from '@/lib/auth';

export default async function TeamLeaderDashboard() {
  try {
    const user = await getUserData();

    if (user.role !== 'team_leader') {
      // Redirect to appropriate dashboard or show an error
      redirect('/dashboard');
    }

    return (
      <DashboardBase userRole="team_leader">
        <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
        {/* Add your team leader specific dashboard content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Equipo</h2>
            {/* Add team management features */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Rendimiento</h2>
            {/* Add performance metrics */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Tareas</h2>
            {/* Add task management features */}
          </div>
        </div>
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}