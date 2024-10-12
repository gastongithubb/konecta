'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { logoutClient } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isPasswordChanged: boolean;
  teamId: number | null;
}

interface ClientNavbarProps {
  user: User;
}

const UserInitials: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
      {initials}
    </div>
  );
};

const ClientNavbar: React.FC<ClientNavbarProps> = ({ user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    try {
      await logoutClient();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const dashboardLink = `/dashboard/${user.role.toLowerCase()}`;

  return (
    <nav className="bg-gray-50 text-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={dashboardLink} className="font-bold text-xl">
              Dashboard
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {user.role.toLowerCase() === 'manager' && (
                <>
                  <Link href="/dashboard/manager/users" className="hover:bg-blue-800 px-3 py-2 rounded-md">
                    Gestionar Usuarios
                  </Link>
                  <Link href="/dashboard/manager/teams" className="hover:bg-blue-800 px-3 py-2 rounded-md">
                    Gestionar Equipos
                  </Link>
                  <Link href="/dashboard/manager/calendario" className="hover:bg-blue-800 px-3 py-2 rounded-md">
                    Calendario
                  </Link>
                </>
              )}
              {user.role.toLowerCase() === 'team_leader' && (
                <>
                  <Link href="/dashboard/team_leader/team" className="hover:bg-blue-500 px-3 py-2 rounded-md">
                    Mi Equipo
                  </Link>
                  <Link href="/dashboard/team_leader/caselist" className="hover:bg-blue-500 px-3 py-2 rounded-md">
                    Ver casos reclamados
                  </Link>
                </>
              )}
              {user.role.toLowerCase() === 'user' && (
                <Link href="/dashboard/user/cases" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                  Cargar Reclamos
                </Link>
              )}
            </div>
          </div>
          <div className="relative flex items-center">
            <span className="mr-4">{user.name}</span>
            <button
              onClick={toggleDropdown}
              className="flex items-center focus:outline-none"
            >
              <UserInitials name={user.name} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                <Link href={`${dashboardLink}/profile`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Perfil
                </Link>
                <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors duration-200"
          >
            <LogOut size={16} className="mr-2" />
            <span>Cerrar Sesión</span>
          </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ClientNavbar;