'use client';

import React from 'react';
import DashboardBase, { UserRole } from '@/app/dashboard/DashboardBase';
import Hero from '@/components/team_leader/Hero';

type UserData = {
  name: string;
  role: string;
  // Add other relevant user data fields
};

const LeaderDashboardClient: React.FC<{ userData: UserData }> = ({ userData }) => {
  const userRole: UserRole = mapApiRoleToNavbarRole(userData.role);

  return (
    <DashboardBase userRole={userRole}>
      <div className="flex flex-col h-screen">
          <Hero />
      </div>
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

export default LeaderDashboardClient;