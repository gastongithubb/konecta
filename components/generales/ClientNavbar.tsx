'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logoutClient } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  ChevronDown, 
  Bell,
  Circle,
  Check 
} from 'lucide-react';
import LogoSrc from '@/public/Logo.webp';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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

interface NavLink {
  label: string;
  href?: string;
  dropdown?: Array<{
    href: string;
    label: string;
    target?: string;
  }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const UserInitials: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold hover:bg-blue-800 transition-colors">
      {initials}
    </div>
  );
};

const ClientNavbar: React.FC<ClientNavbarProps> = ({ user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNavDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Error al cargar notificaciones');
      
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((notif: Notification) => !notif.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutClient();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const dashboardLink = `/dashboard/${user.role.toLowerCase()}`;

  const navLinks: NavLink[] = user.role.toLowerCase() === 'user' ? [
    {
      label: 'NPS',
      dropdown: [
        { href: '/nps-individual', label: 'NPS Individual' },
        { href: '/trimestral', label: 'NPS Trimestral' },
        { href: '/balance-mensual', label: 'Balance Mensual' },
        { href: '/metricas-equipo', label: 'Métricas Equipo' },
        { href: '/promotores', label: 'Encuestas NPS' }
      ]
    },
    {
      label: 'Herramientas',
      dropdown: [
        { href: '/dashboard/user/cases', label: 'Reclamos de F4' },
        { href: '/dashboard/user/sla', label: 'SLA' },
        { href: 'https://drive.google.com/drive/folders/18ybMUFRbqUEeTlpEDboTkSssReiDlYl8', label: 'PLANES SIN COPAGO ', target: '_blank' },
        { href: 'https://drive.google.com/drive/u/1/folders/1NqkSefEZx0w88bNOLYoZdDU_JIEX5P-_', label: 'PLANES CON COPAGO ', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1zDsHZoAQqTmGqv0LnxDyRuve24V0g7E6BtT40EyG8us/edit?gid=3622276#gid=3622276', label: 'Rangos de edad excluidos', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/10dZhGPjLzw4XxZQ3uZdNmQtUo64clE9jNnWBkkUKezQ/edit#gid=0', label: 'Protesis en Ambulatorio', target: '_blank' },
        { href: 'https://drive.google.com/file/d/1WrBLlnFoTYoWQhGw8ez83VCpn3d5h4-o/view?usp=sharing', label: 'Carga de CUD (Proceso)', target: '_blank' },
        { href: '/dashboard/user/nomencladorNU', label: 'Practicas por codigo NU y NB' },
        { href: '/dashboard/user/nomencladorNM', label: 'Practicas por codigo NM' }
      ]
    },
    {
      label: 'Vademecum',
      dropdown: [
        { href: 'https://docs.google.com/spreadsheets/d/1720VTYilXZxEHKnWYpq5R7x2hkswnGfd/edit?rtpof=true&sd=true&gid=2119192922#gid=2119192922', label: 'PMI Sustentable, C y OS', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1GDfmi_CBvcmeJZKWyKFtx6eGZqppraUOyFSqe0SBExE/edit?gid=1182941618#gid=1182941618', label: 'Salud Reproductiva', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1GeHNHLQjdRnzl2uI6eMVy0J5a5dxqBxFQiDAvVrCIZA/edit?gid=1361535532#gid=1361535532', label: 'Manual Farmaceutico', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/13R6tt3O36BfMeSDuSwfwzwi9dYP4FHhDEtj8rIBZ_Gw/edit?gid=2095242313#gid=2095242313', label: 'Cronicos', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1aj5NU2iU4NeIiLdhIcBAKUY4xMfhNrqm/edit?gid=1202509401#gid=1202509401', label: 'Sustentable', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1UI_ihqmhAKsH9TOJ9E4b7Wjln9a5Vyav/edit?gid=1234629926#gid=1234629926', label: 'Leche Medicamentosa', target: '_blank' },
      ]
    },
    { href: '/dashboard/user/foro', label: 'Pizarra' },
    {
      label: 'Mas',
      dropdown: [
        { href: 'https://docs.google.com/spreadsheets/d/1fyjXUOIYC1JqVFNvNyfTKs5uncUgqYFWPXpBc-sbg54/edit?gid=0#gid=0', label: 'Requisitos de Reintegros', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1gOo19k_g8nB_WFcPkOunkL9J-CtUBNBdKO2AUQz5hIo/edit?gid=0#gid=0', label: 'falta de prestadores en zona por practicas', target: '_blank' },
        { href: 'https://docs.google.com/document/d/11CievaucFwk5HtAXkluA9e9J7pnmHBub/edit', label: 'Medios de Cobro', target: '_blank' },
        { href: '/dashboard/user/speech', label: 'Speech de corte' },
        { href: 'https://docs.google.com/spreadsheets/d/1yL12CvA2pcDi6O6F0GcVPt7FiJPX_dHBr6gZOpeihSE/edit?gid=644205541#gid=644205541', label: 'CAR Status', target: '_blank' },
      ]
    },
  ] : [];

  return (
    <nav className="bg-gray-50 text-gray-800 shadow-lg z-50 h-16 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={dashboardLink} className="flex items-center">
              <Image src={LogoSrc} alt="Logo" width={130} height={60} className="mr-2" unoptimized />
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {user.role.toLowerCase() === 'manager' && (
                <>
                  <Link href="/dashboard/manager/users" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition-colors">
                    Incidencias
                  </Link>
                  <Link href="/dashboard/manager/teams" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition-colors">
                    Gestionar Equipos
                  </Link>
                  <Link href="/dashboard/manager/calendario" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition-colors">
                    Calendario
                  </Link>
                  <Link href="/dashboard/manager/bienestar" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition-colors">
                    Encuesta Bienestar
                  </Link>
                </>
              )}
              {user.role.toLowerCase() === 'team_leader' && (
                <>
                  <Link href="/dashboard/team_leader/equipo" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                    Mi Equipo
                  </Link>
                  <Link href="/dashboard/team_leader/teams" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                    Gestionar Equipos
                  </Link>
                  <Link href="/dashboard/team_leader/caselist" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                    Ver casos reclamados
                  </Link>
                  
                  <Link href="/dashboard/team_leader/bienestar" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                    Encuesta Bienestar
                  </Link>
                  <Link href="/dashboard/team_leader/caseSeguimiento" className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                    Casos Dev/Fin
                  </Link>
                </>
              )}
              {user.role.toLowerCase() === 'user' && (
                <>
                  {navLinks.map((link, index) => (
                    <div key={index} className="relative group">
                      {link.href ? (
                        <Link href={link.href} className="hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md">
                          {link.label}
                        </Link>
                      ) : (
                        <button
                          onClick={() => toggleNavDropdown(link.label)}
                          className="flex items-center hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md"
                        >
                          {link.label}
                          <ChevronDown size={16} className="ml-1" />
                        </button>
                      )}
                      {link.dropdown && openDropdown === link.label && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                          {link.dropdown.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={item.href}
                              target={item.target}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80" 
                align="end"
                forceMount
              >
                <div className="flex items-center justify-between p-2">
                  <p className="text-sm font-medium">Notificaciones</p>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">
                      {unreadCount} nueva{unreadCount !== 1 && 's'}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Cargando notificaciones...
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-1">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {!notification.read && (
                                <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
                              )}
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="ml-2 h-8 w-8 hover:bg-blue-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No hay notificaciones
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Perfil de Usuario */}
            <div className="relative flex items-center">
              <span className="mr-4 text-sm font-medium">{user.name}</span>
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
              >
                <UserInitials name={user.name} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                  <Link 
                    href={`${dashboardLink}/profile`} 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ClientNavbar;