import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  userRole: 'manager' | 'team_leader' | 'user';
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  return (
    <aside className="w-64 bg-indigo-700 text-white p-6">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block py-2 px-4 hover:bg-indigo-600 rounded">
              Dashboard
            </Link>
          </li>
          {userRole === 'manager' && (
            <>
              <li>
                <Link href="/dashboard/users" className="block py-2 px-4 hover:bg-indigo-600 rounded">
                  Gestionar Usuarios
                </Link>
              </li>
              <li>
                <Link href="/dashboard/teams" className="block py-2 px-4 hover:bg-indigo-600 rounded">
                  Gestionar Equipos
                </Link>
              </li>
            </>
          )}
          {userRole === 'team_leader' && (
            <li>
              <Link href="/dashboard/team" className="block py-2 px-4 hover:bg-indigo-600 rounded">
                Mi Equipo
              </Link>
            </li>
          )}
          <li>
            <Link href="/dashboard/profile" className="block py-2 px-4 hover:bg-indigo-600 rounded">
              Perfil
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;