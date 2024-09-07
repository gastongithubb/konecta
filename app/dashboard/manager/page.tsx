import React from 'react';
import { redirect } from 'next/navigation';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { getUserData } from '@/lib/auth';

export default async function ManagerDashboard() {
  try {
    const user = await getUserData();

    if (user.role !== 'manager') {
      // Redirect to appropriate dashboard or show an error
      redirect('/dashboard');
    }

    return (
      <DashboardBase userRole="manager">
        <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
        {/* Add your manager specific dashboard content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Resumen de Equipos</h2>
            {/* Add team overview features */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Métricas de Rendimiento</h2>
            {/* Add performance metrics */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Proyectos Activos</h2>
            {/* Add active projects list */}
          </div>
        </div>
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}