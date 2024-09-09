import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface NavbarProps {
  userRole: 'manager' | 'team_leader' | 'user';
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <Link href="/dashboard" className="font-bold text-xl">
              Menu
            </Link> 
            <div className="ml-10 flex items-baseline space-x-4">
              {userRole === 'manager' && (
                <>
                  <Link href="/dashboard/users" className="hover:bg-blue-800 px-3 py-2 rounded-md">
                    Gestionar Usuarios
                  </Link>
                  <Link href="/dashboard/teams" className="hover:bg-blue-800 px-3 py-2 rounded-md">
                    Gestionar Equipos
                  </Link>
                </>
              )}
              {userRole === 'team_leader' && (
                <Link href="/dashboard/team" className="hover:bg-blue-500 px-3 py-2 rounded-md">
                  Mi Equipo
                </Link>
              )}
              <Link href="/dashboard/profile" className="hover:bg-blue-700 px-3 py-2 rounded-md">
                Perfil
              </Link>
            </div>
          </div>
          <div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;