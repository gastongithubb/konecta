'use client';

import React from 'react';
import DashboardBase, { UserRole } from '@/app/dashboard/DashboardBase';
import Sidebar from '@/components/team_leader/sidebar'
import Hero from '@/components/users/Hero/hero'
import Frases from '@/components/users/Frases/frases'
import Cases from '@/components/users/casos/cases'
import Footer from '@/components/Footer';

type UserData = {
  name: string;
  role: string;
  // Add other relevant user data fields
};

const AgentDashboardClient: React.FC<{ userData: UserData }> = ({ userData }) => {
  const userRole: UserRole = mapApiRoleToNavbarRole(userData.role);

  return (
    <DashboardBase userRole={userRole}>
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex">
          <Sidebar />
        </div>
        <Hero />
          <Frases />
          <Cases />
          <Footer />
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