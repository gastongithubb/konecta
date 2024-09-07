import React from 'react';
import { redirect } from 'next/navigation';
import DashboardBase from '@/app/dashboard/DashboardBase';
import { getUserData, verifyAccessToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function AgentDashboard() {
  try {
    // Get the token from cookies
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const decoded = verifyAccessToken(token);
    
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token');
    }

    const user = await getUserData(decoded.sub);

    // Ensure user.role is one of the expected values
    const userRole = user.role === 'user' ? 'user' : 
                     user.role === 'manager' ? 'manager' : 
                     user.role === 'team_leader' ? 'team_leader' : 
                     'user'; // Default to 'user' if role is unexpected

    return (
      <DashboardBase userRole={userRole}>
        <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
        {/* Resto del contenido del dashboard */}
      </DashboardBase>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}