// AgentDashboardClient.tsx
'use client';

import React from 'react';
import DashboardBase, { UserRole } from '@/app/dashboard/DashboardBase';
import Hero from '@/components/users/Hero/hero'
import Frases from '@/components/users/Frases/frases'
import Cases from '@/components/users/casos/cases'

type UserData = {
  name: string;
  role: string;
  // Add other relevant user data fields
};

const AgentDashboardClient: React.FC<{ userData: UserData }> = ({ userData }) => {
  const userRole: UserRole = mapApiRoleToNavbarRole(userData.role);

  return (
    <DashboardBase userRole={userRole}>
      <div className="flex flex-col min-h-full">
        <Hero />
        <Frases />
        <Cases />
      </div>
      {/* Add agent-specific dashboard content here */}
    </DashboardBase>
  );
};

function mapApiRoleToNavbarRole(apiRole: string): UserRole {
  switch (apiRole) {
    case 'manager': return 'manager';
    case 'team_leader': return 'team_leader';
    case 'user': return 'user';
    default:
      console.warn(`Unknown role: ${apiRole}. Defaulting to 'user'.`);
      return 'user';
  }
}

export default AgentDashboardClient;