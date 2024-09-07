import React from 'react';
import DashboardBase from '@/app/dashboard/DashboardBase';

interface User {
  name: string;
  // Añade otras propiedades del usuario según sea necesario
}

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  return (
    <DashboardBase userRole="user">
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>
      {/* Resto del contenido del dashboard */}
    </DashboardBase>
  );
};

export default UserDashboard;