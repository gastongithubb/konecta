'use client';

import React from 'react';
import DashboardBase, { UserRole } from '@/app/dashboard/DashboardBase';

type UserData = {
  name: string;
  role: string;
  // Add other relevant user data fields
};

const AgentDashboardClient: React.FC<{ userData: UserData }> = ({ userData }) => {
  const userRole: UserRole = mapApiRoleToNavbarRole(userData.role);

  return (
    <DashboardBase userRole={userRole}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Bienvenid@, {userData.name}</h1>
        {userRole === 'user' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Panel de Agente</h2>
            {/* Add agent-specific dashboard content here */}
            <p>Aquí puedes agregar el contenido específico para el dashboard del agente.</p>
          </div>
        )}
      </div>
    </DashboardBase>
  );
};

function mapApiRoleToNavbarRole(apiRole: string): UserRole {
  switch (apiRole) {
    case 'manager': return 'manager';
    case 'team_leader': return 'team_leader';
    case 'agent': return 'user'; // Assuming 'agent' maps to 'user' in the UserRole type
    case 'user': return 'user';
    default:
      console.warn(`Unknown role: ${apiRole}. Defaulting to 'user'.`);
      return 'user';
  }
}

export default AgentDashboardClient;