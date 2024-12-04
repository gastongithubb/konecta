// ClientNavbar.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logoutClient } from '@/app/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LogOut, 
  ChevronDown, 
  Bell,
  Circle,
  Check,
  Menu,
  X,
  User,
  Users,
  Calendar,
  Activity,
  FileText,
  Wrench,
  Book,
  Grid,
  ChevronRight,
  BadgePlus
} from 'lucide-react';
import LogoSrc from '@/public/Logo.webp';
import { ThemeToggle } from '@/components/Themeprovider';
import { useTheme } from "next-themes";
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

// Interfaces
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
  icon?: React.ComponentType<any>;
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

interface UserInitialsProps {
  name: string;
  className?: string;
}

interface NavLinkProps {
  href: string;
  isActive?: boolean;
  target?: string;
  icon?: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}

const UserInitials: React.FC<UserInitialsProps> = ({ name, className }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-md hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all ${className || ''}`}>
      {initials}
    </div>
  );
};

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  isActive, 
  target, 
  icon: Icon, 
  children,
  className 
}) => (
  <Link
    href={href}
    target={target}
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive 
        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
    } ${className || ''}`}
  >
    {Icon && <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />}
    {children}
  </Link>
);

const ClientNavbar: React.FC<ClientNavbarProps> = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleNavDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
  
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    }
  }

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
      label: 'Metricas',
      icon: Activity,
      dropdown: [
        { href: '/nps-individual', label: 'NPS Individual' },
        { href: '/trimestral', label: 'NPS Trimestral' },
        { href: '/balance-mensual', label: 'Balance Mensual' },
      ]
    },
    {
      label: 'Herramientas',
      icon: Wrench,
      dropdown: [
        { href: '/dashboard/user/cases', label: 'Formulario F4' },
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
      icon: Book,
      dropdown: [
        { href: 'https://docs.google.com/spreadsheets/d/1720VTYilXZxEHKnWYpq5R7x2hkswnGfd/edit?rtpof=true&sd=true&gid=2119192922#gid=2119192922', label: 'PMI Sustentable, C y OS', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1GDfmi_CBvcmeJZKWyKFtx6eGZqppraUOyFSqe0SBExE/edit?gid=1182941618#gid=1182941618', label: 'Salud Reproductiva', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1GeHNHLQjdRnzl2uI6eMVy0J5a5dxqBxFQiDAvVrCIZA/edit?gid=1361535532#gid=1361535532', label: 'Manual Farmaceutico', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/13R6tt3O36BfMeSDuSwfwzwi9dYP4FHhDEtj8rIBZ_Gw/edit?gid=2095242313#gid=2095242313', label: 'Cronicos', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1aj5NU2iU4NeIiLdhIcBAKUY4xMfhNrqm/edit?gid=1202509401#gid=1202509401', label: 'Sustentable', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1UI_ihqmhAKsH9TOJ9E4b7Wjln9a5Vyav/edit?gid=1234629926#gid=1234629926', label: 'Leche Medicamentosa', target: '_blank' },
      ]
    },
    { 
      label: 'Pizarra',
      icon: Grid,
      href: '/dashboard/user/foro'
    },
    {
      label: 'Mas',
      icon: BadgePlus,
      dropdown: [
        { href: 'https://docs.google.com/spreadsheets/d/1fyjXUOIYC1JqVFNvNyfTKs5uncUgqYFWPXpBc-sbg54/edit?gid=0#gid=0', label: 'Requisitos de Reintegros', target: '_blank' },
        { href: 'https://drive.google.com/file/d/1YyisLBTH1-vpHDsNB-u1VOvzc_DpGG_T/view?utm_admin=116921&pli=1', label: 'Reintegro Cobro Plus', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/1gOo19k_g8nB_WFcPkOunkL9J-CtUBNBdKO2AUQz5hIo/edit?gid=0#gid=0', label: 'falta de prestadores en zona por practicas', target: '_blank' },
        { href: 'https://docs.google.com/document/d/11CievaucFwk5HtAXkluA9e9J7pnmHBub/edit', label: 'Medios de Cobro', target: '_blank' },
        { href: '/dashboard/user/speech', label: 'Speech de corte' },
        { href: 'https://repo.sancorsalud.com.ar/webinstitucional/assets/pdf/comparti-salud/BasesCondicionesProgramaCompartiSalud2024V6.pdf', label: 'Campaña Comparti Salud', target: '_blank'},
        { href: 'https://docs.google.com/document/d/1W7UVMff4n0CSNdecZna-oydsttIYsAHL/edit', label: 'Glosario Calidad', target: '_blank'},
        { href: 'https://docs.google.com/spreadsheets/d/1VHQPVUZFEKlwGbe00q5sVK11WEDOqabY6l9FsfJ0vLs/edit?gid=760225460#gid=760225460', label: 'Tabulador CRM', target: '_blank'},
        { href: 'https://docs.google.com/spreadsheets/d/1yL12CvA2pcDi6O6F0GcVPt7FiJPX_dHBr6gZOpeihSE/edit?gid=644205541#gid=644205541', label: 'CAR Status', target: '_blank' },
        { href: 'https://docs.google.com/spreadsheets/d/10kRYSd2iyN0OFR2sLuaclPgNWbohmgh3RRhd0NhZqNE/edit?gid=0#gid=0', label: 'Motivos de rechazos Online', target: '_blank' },
      ]
    },
  ] : [];

  const renderNotificationDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2 bg-white dark:bg-gray-900" align="end">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notificaciones</p>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {unreadCount} nueva{unreadCount !== 1 && 's'}
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {/* ... Notification content with dark mode classes ... */}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={dashboardLink} className="flex items-center">
              <Image 
                src={LogoSrc} 
                alt="Logo" 
                width={120} 
                height={40} 
                className="mr-2 dark:brightness-200" 
                unoptimized 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user.role.toLowerCase() === 'manager' && (
              <>
                <NavLink 
                  href="/dashboard/manager/users" 
                  isActive={pathname === '/dashboard/manager/users'}
                  icon={Users}
                >
                  Incidencias
                </NavLink>
                <NavLink 
                  href="/dashboard/manager/teams" 
                  isActive={pathname === '/dashboard/manager/teams'}
                  icon={Users}
                >
                  Gestionar Equipos
                </NavLink>
                <NavLink 
                  href="/dashboard/manager/calendario" 
                  isActive={pathname === '/dashboard/manager/calendario'}
                  icon={Calendar}
                >
                  Calendario
                </NavLink>
                <NavLink 
                  href="/dashboard/manager/bienestar" 
                  isActive={pathname === '/dashboard/manager/bienestar'}
                  icon={Activity}
                >
                  Encuesta Bienestar
                </NavLink>
              </>
            )}

            {user.role.toLowerCase() === 'team_leader' && (
              <>
                <NavLink 
                  href="/dashboard/team_leader/equipo" 
                  isActive={pathname === '/dashboard/team_leader/equipo'}
                  icon={Users}
                >
                  Mi Equipo
                </NavLink>
                <NavLink 
                  href="/dashboard/team_leader/caselist" 
                  isActive={pathname === '/dashboard/team_leader/caselist'}
                  icon={FileText}
                >
                  Ver casos reclamados
                </NavLink>
                <NavLink 
                  href="/dashboard/team_leader/bienestar" 
                  isActive={pathname === '/dashboard/team_leader/bienestar'}
                  icon={Activity}
                >
                  Encuesta Bienestar
                </NavLink>
                <NavLink 
                  href="/dashboard/team_leader/caseSeguimiento" 
                  isActive={pathname === '/dashboard/team_leader/caseSeguimiento'}
                  icon={FileText}
                >
                  Casos Dev/Fin
                </NavLink>
              </>
            )}

            {user.role.toLowerCase() === 'user' && (
              <>
                {navLinks.map((link, index) => (
                  <div key={index} className="relative group">
                    {link.href ? (
                      <NavLink 
                        href={link.href}
                        isActive={pathname === link.href}
                        icon={link.icon}
                      >
                        {link.label}
                      </NavLink>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                          >
                            {link.icon && <link.icon className="mr-2 h-4 w-4 text-gray-500" />}
                            {link.label}
                            <ChevronDown size={16} className="ml-1" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          {link.dropdown?.map((item, itemIndex) => (
                            <DropdownMenuItem key={itemIndex}>
                              <Link
                                href={item.href}
                                target={item.target}
                                className="flex items-center w-full text-sm text-gray-700 hover:text-gray-900"
                              >
                                {item.label}
                                {item.target === '_blank' && (
                                  <ChevronRight className="ml-auto h-4 w-4" />
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {renderNotificationDropdown()}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                    {user.name}
                  </span>
                  <UserInitials name={user.name} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Link 
                    href={`${dashboardLink}/profile`}
                    className="flex items-center w-full"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                {user.role.toLowerCase() === 'user' && (
                  <DropdownMenuItem>
                    <Link 
                      href={`${dashboardLink}/equipoUsers`}
                      className="flex items-center w-full"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>Miembros del Equipo</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 dark:text-gray-200" />
              ) : (
                <Menu className="h-6 w-6 dark:text-gray-200" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <ScrollArea className="max-h-[calc(100vh-4rem)] py-4">
            <div className="px-4 space-y-1">
              {user.role.toLowerCase() === 'manager' && (
                <>
                  <NavLink href="/dashboard/manager/users" icon={Users}>
                    Incidencias
                  </NavLink>
                  <NavLink href="/dashboard/manager/teams" icon={Users}>
                    Gestionar Equipos
                  </NavLink>
                  <NavLink href="/dashboard/manager/calendario" icon={Calendar}>
                    Calendario
                  </NavLink>
                  <NavLink href="/dashboard/manager/bienestar" icon={Activity}>
                    Encuesta Bienestar
                  </NavLink>
                </>
              )}

              {user.role.toLowerCase() === 'team_leader' && (
                <>
                  <NavLink href="/dashboard/team_leader/equipo" icon={Users}>
                    Mi Equipo
                  </NavLink>
                  <NavLink href="/dashboard/team_leader/caselist" icon={FileText}>
                    Ver casos reclamados
                  </NavLink>
                  <NavLink href="/dashboard/team_leader/bienestar" icon={Activity}>
                    Encuesta Bienestar
                  </NavLink>
                  <NavLink href="/dashboard/team_leader/caseSeguimiento" icon={FileText}>
                    Casos Dev/Fin
                  </NavLink>
                </>
              )}

              {user.role.toLowerCase() === 'user' && navLinks.map((link, index) => (
                <div key={index} className="py-1">
                  {link.href ? (
                    <NavLink href={link.href} icon={link.icon}>
                      {link.label}
                    </NavLink>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleNavDropdown(link.label)}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
                      >
                        {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                        {link.label}
                        <ChevronDown 
                          size={16} 
                          className={`ml-auto transition-transform ${
                            openDropdown === link.label ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openDropdown === link.label && link.dropdown && (
                        <div className="mt-1 ml-4 space-y-1">
                          {link.dropdown.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={item.href}
                              target={item.target}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
                            >
                              {item.label}
                              {item.target === '_blank' && (
                                <ChevronRight className="inline-block ml-2 h-4 w-4" />
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </nav>
  );
};

export default ClientNavbar;