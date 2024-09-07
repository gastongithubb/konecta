import React from 'react';
import DashboardBase from '@/app/dashboard/DashboardBase';

interface User {
  name: string;
  // Añade otras propiedades del usuario según sea necesario
}

interface ManagerDashboardProps {
  user: User;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  return (
    <DashboardBase userRole="manager">
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
      {/* Resto del contenido del dashboard */}
    </DashboardBase>
  );
};

export default ManagerDashboard;