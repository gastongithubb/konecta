'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { logoutClient } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/user'; // Adjust the import path as needed


interface NavbarProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    userRole: UserRole;
    isPasswordChanged: boolean;
    teamId: number | null;
  } | null;
}

const UserInitials: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
      {initials}
    </div>
  );
};

const Navbar: React.FC<NavbarProps> = ({ user }) => {
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

  if (!user) {
    return null; // O podrías mostrar un componente de carga aquí
  }

  const dashboardLink = `/dashboard/${user.role.toLowerCase()}`;

  return (
    <nav className="bg-[#003153] text-white shadow-lg">
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
                </>
              )}
              {user.role.toLowerCase() === 'leader' && (
                <Link href="/dashboard/team_leader/team" className="hover:bg-blue-500 px-3 py-2 rounded-md">
                  Mi Equipo
                </Link>
              )}
              {user.role.toLowerCase() === 'agent' && (
                <Link href="/dashboard/agent/tasks" className="hover:bg-blue-500 px-3 py-2 rounded-md">
                  Mis Tareas
                </Link>
              )}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center focus:outline-none"
            >
              <UserInitials name={user.name} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                <Link href={`${dashboardLink}/profile`} className="hover:bg-gray-100 px-3 py-2 rounded-md">
                Perfil
                </Link>
                </button>

                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Cerrar Sesión
                </button>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;