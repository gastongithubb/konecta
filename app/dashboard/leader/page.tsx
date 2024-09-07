import React from 'react';
import DashboardBase from '@/app/dashboard/DashboardBase';

interface User {
  name: string;
  // Añade otras propiedades del usuario según sea necesario
}

interface TeamLeaderDashboardProps {
  user: User;
}

const TeamLeaderDashboard: React.FC<TeamLeaderDashboardProps> = ({ user }) => {
  return (
    <DashboardBase userRole="team_leader">
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
      {/* Resto del contenido del dashboard */}
    </DashboardBase>
  );
};

export default TeamLeaderDashboard;