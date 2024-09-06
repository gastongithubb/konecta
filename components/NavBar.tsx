/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

type UserRole = 'manager' | 'team_leader' | 'user';

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as UserRole;

  const getNavItems = (role: UserRole) => {
    switch (role) {
      case 'manager':
        return (
          <>
            <Link href="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
            <Link href="/teams" className="text-white hover:text-gray-300">Equipos</Link>
            <Link href="/reports" className="text-white hover:text-gray-300">Informes</Link>
          </>
        );
      case 'team_leader':
        return (
          <>
            <Link href="/team-dashboard" className="text-white hover:text-gray-300">Dashboard del Equipo</Link>
            <Link href="/tasks" className="text-white hover:text-gray-300">Tareas</Link>
            <Link href="/team-members" className="text-white hover:text-gray-300">Miembros del Equipo</Link>
          </>
        );
      case 'user':
        return (
          <>
            <Link href="/my-tasks" className="text-white hover:text-gray-300">Mis Tareas</Link>
            <Link href="/profile" className="text-white hover:text-gray-300">Perfil</Link>
          </>
        );
      default:
        return (
          <Link href="/profile" className="text-white hover:text-gray-300">Perfil</Link>
        );
    }
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">Konecta Sancor</Link>
        <div className="space-x-4">
          {session ? (
            <>
              {getNavItems(userRole)}
              <button 
                onClick={() => signOut()} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link href="/login" className="text-white hover:text-gray-300">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;