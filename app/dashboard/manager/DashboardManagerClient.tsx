'use client';

import React from 'react';
import DashboardBase from '@/app/dashboard/DashboardBase';
import TeamLeaderManagement from '@/components/admin/TeamLeaderManagement';

interface DashboardManagerClientProps {
  user: {
    name: string;
    role: string;
  };
}

export default function DashboardManagerClient({ user }: DashboardManagerClientProps) {
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
}