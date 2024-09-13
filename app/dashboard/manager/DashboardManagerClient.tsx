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
  return (
    <DashboardBase>
      <h1 className="text-3xl font-bold mb-6">Bienvenid@, {user.name}</h1>
      {user.role === 'manager' && <TeamLeaderManagement />}
      {/* Otro contenido del dashboard específico para cada rol */}
    </DashboardBase>
  );
}