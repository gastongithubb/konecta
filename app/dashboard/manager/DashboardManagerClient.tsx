// app/dashboard/manager/DashboardManagerClient.tsx

'use client';

import React from 'react';
import DashboardBase from '@/app/dashboard/DashboardBase';
import Hero from '@/components/admin/Hero';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isPasswordChanged: boolean;
  teamId: number | null;
}

interface DashboardManagerClientProps {
  user: User;
}

export default function DashboardManagerClient({ user }: DashboardManagerClientProps) {
  const userRole = user.role === 'user' ? 'user' :
                   user.role === 'manager' ? 'manager' :
                   user.role === 'team_leader' ? 'team_leader' :
                   'user';

  return (
    <DashboardBase userRole={userRole}>
      {/* Otro contenido del dashboard específico para cada rol */}
      <Hero userRole={''} />
    </DashboardBase>
  );
}