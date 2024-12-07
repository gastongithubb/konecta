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
  BadgePlus,
} from 'lucide-react';
import LogoSrc from '@/public/Logo.webp';
import { ThemeToggle } from '@/components/ThemeProvider';
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
import { LucideIcon } from 'lucide-react';


// Interfaces base
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

// Menu interfaces
interface BaseMenuItem {
  label: string;
  icon?: LucideIcon;
  target?: string;
}

// Link item - type es requerido
interface LinkItem extends BaseMenuItem {
  type: 'link';
  href: string;
}

// Submenu item - type es requerido
interface SubMenuDropdownItem extends BaseMenuItem {
  type: 'submenu';
  subDropdown: LinkItem[];
}

// Dropdown item - union type for items that can appear in a dropdown
type DropdownItem = LinkItem | SubMenuDropdownItem;

// NavLink interface - separado de LinkItem para manejar diferentes requisitos
interface NavLink extends BaseMenuItem {
  type: 'link' | 'dropdown';  // type es requerido aquí también
  href?: string;
  dropdown?: DropdownItem[];
}

// Type guards mejorados
function isSubMenuItem(item: DropdownItem | NavLink): item is SubMenuDropdownItem {
  return item.type === 'submenu';
}

function isLinkItem(item: DropdownItem | NavLink): item is LinkItem {
  return item.type === 'link' && 'href' in item;
}

function isNavLinkWithDropdown(item: NavLink): item is NavLink & { type: 'dropdown'; dropdown: DropdownItem[] } {
  return item.type === 'dropdown' && !!item.dropdown;
}


// Interfaces para los componentes
interface UserInitialsProps {
  name: string;
  className?: string;
}

interface NavLinkProps {
  href: string;
  isActive?: boolean;
  target?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

// Componente UserInitials
const UserInitials: React.FC<UserInitialsProps> = ({ name, className }) => {
  // Agregar type annotation explícita para n
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  return (
    <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-md hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all ${className || ''}`}>
      {initials}
    </div>
  );
};

// Componente NavLink
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

export type { UserInitialsProps, NavLinkProps };
export { UserInitials, NavLink };

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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logoutClient();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  const dashboardLink = `/dashboard/${user.role.toLowerCase()}`;

  const navLinks: NavLink[] = user.role.toLowerCase() === 'user' ? [
    {
      type: 'dropdown',
      label: 'Metricas',
      icon: Activity,
      dropdown: [
        { type: 'link', href: '/nps-individual', label: 'NPS Individual' },
        { type: 'link', href: '/trimestral', label: 'NPS Trimestral' },
        { type: 'link', href: '/balance-mensual', label: 'Balance Mensual' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Herramientas',
      icon: Wrench,
      dropdown: [
        { type: 'link', href: '/dashboard/user/cases', label: 'Formulario F4' },
        { type: 'link', href: '/dashboard/user/sla', label: 'SLA' },
        { type: 'link', href: 'https://drive.google.com/drive/folders/18ybMUFRbqUEeTlpEDboTkSssReiDlYl8', label: 'PLANES SIN COPAGO', target: '_blank' },
        { type: 'link', href: 'https://drive.google.com/drive/u/1/folders/1NqkSefEZx0w88bNOLYoZdDU_JIEX5P-_', label: 'PLANES CON COPAGO', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1zDsHZoAQqTmGqv0LnxDyRuve24V0g7E6BtT40EyG8us/edit?gid=3622276#gid=3622276', label: 'Rangos de edad excluidos', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/10dZhGPjLzw4XxZQ3uZdNmQtUo64clE9jNnWBkkUKezQ/edit#gid=0', label: 'Protesis en Ambulatorio', target: '_blank' },
        { type: 'link', href: 'https://drive.google.com/file/d/1WrBLlnFoTYoWQhGw8ez83VCpn3d5h4-o/view?usp=sharing', label: 'Carga de CUD (Proceso)', target: '_blank' },
        { type: 'link', href: '/dashboard/user/nomencladorNU', label: 'Practicas por codigo NU y NB' },
        { type: 'link', href: '/dashboard/user/nomencladorNM', label: 'Practicas por codigo NM' }
      ]
    },
    {
      type: 'dropdown',
      label: 'Vademecum',
      icon: Book,
      dropdown: [
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1720VTYilXZxEHKnWYpq5R7x2hkswnGfd/edit?rtpof=true&sd=true&gid=2119192922#gid=2119192922', label: 'PMI Sustentable, C y OS', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1GDfmi_CBvcmeJZKWyKFtx6eGZqppraUOyFSqe0SBExE/edit?gid=1182941618#gid=1182941618', label: 'Salud Reproductiva', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1GeHNHLQjdRnzl2uI6eMVy0J5a5dxqBxFQiDAvVrCIZA/edit?gid=1361535532#gid=1361535532', label: 'Manual Farmaceutico', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/13R6tt3O36BfMeSDuSwfwzwi9dYP4FHhDEtj8rIBZ_Gw/edit?gid=2095242313#gid=2095242313', label: 'Cronicos', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1aj5NU2iU4NeIiLdhIcBAKUY4xMfhNrqm/edit?gid=1202509401#gid=1202509401', label: 'Sustentable', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1UI_ihqmhAKsH9TOJ9E4b7Wjln9a5Vyav/edit?gid=1234629926#gid=1234629926', label: 'Leche Medicamentosa', target: '_blank' },
      ]
    },
    { 
      type: 'link',
      label: 'Pizarra',
      icon: Grid,
      href: '/dashboard/user/foro'
    },
    {
      type: 'dropdown',
      label: 'Mas',
      icon: BadgePlus,
      dropdown: [
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1fyjXUOIYC1JqVFNvNyfTKs5uncUgqYFWPXpBc-sbg54/edit?gid=0#gid=0', label: 'Requisitos de Reintegros', target: '_blank' },
        { type: 'link', href: 'https://drive.google.com/file/d/1YyisLBTH1-vpHDsNB-u1VOvzc_DpGG_T/view?utm_admin=116921&pli=1', label: 'Reintegro Cobro Plus', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/u/1/d/1_a9DEAVfE9DEzpgyw_6xxilQRgXRDXZv0FWq4Wlnm4w/edit?gid=0#gid=0', label: 'Mejoras plan F800', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1gOo19k_g8nB_WFcPkOunkL9J-CtUBNBdKO2AUQz5hIo/edit?gid=0#gid=0', label: 'falta de prestadores en zona por practicas', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/document/d/11CievaucFwk5HtAXkluA9e9J7pnmHBub/edit', label: 'Medios de Cobro', target: '_blank' },
        { type: 'link', href: '/dashboard/user/speech', label: 'Speech de corte' },
        { type: 'link', href: 'https://repo.sancorsalud.com.ar/webinstitucional/assets/pdf/comparti-salud/BasesCondicionesProgramaCompartiSalud2024V6.pdf', label: 'Campaña Comparti Salud', target: '_blank'},
        { type: 'link', href: 'https://docs.google.com/document/d/1W7UVMff4n0CSNdecZna-oydsttIYsAHL/edit', label: 'Glosario Calidad', target: '_blank'},
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1VHQPVUZFEKlwGbe00q5sVK11WEDOqabY6l9FsfJ0vLs/edit?gid=760225460#gid=760225460', label: 'Tabulador CRM', target: '_blank'},
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1yL12CvA2pcDi6O6F0GcVPt7FiJPX_dHBr6gZOpeihSE/edit?gid=644205541#gid=644205541', label: 'CAR Status', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/10kRYSd2iyN0OFR2sLuaclPgNWbohmgh3RRhd0NhZqNE/edit?gid=0#gid=0', label: 'Motivos de rechazos Online', target: '_blank' },
        { type: 'link', href: 'https://forms.gle/z8NfFEZGnc5V6eKFA', label: 'Casos de VN', target: '_blank' },

      ]
    },
  ] : [];

  const navLinksLeader: NavLink[] = user.role.toLowerCase() === 'team_leader' ? [
    {
      type: 'dropdown',
      label: 'Reps',
      icon: Menu,
      dropdown: [
        {
          type: 'submenu',
          label: 'Metricas',
          icon: Activity,
          subDropdown: [
            { type: 'link', href: '/nps-individual', label: 'NPS Individual' },
            { type: 'link', href: '/trimestral', label: 'NPS Trimestral' },
            { type: 'link', href: '/balance-mensual', label: 'Balance Mensual' },
          ]
        },
        {
          type: 'submenu',
          label: 'Herramientas',
          icon: Wrench,
          subDropdown: [
            { type: 'link', href: '/dashboard/user/cases', label: 'Formulario F4' },
            { type: 'link', href: '/dashboard/user/sla', label: 'SLA' },
            { type: 'link', href: 'https://drive.google.com/drive/folders/18ybMUFRbqUEeTlpEDboTkSssReiDlYl8', label: 'PLANES SIN COPAGO', target: '_blank' },
            { type: 'link', href: 'https://drive.google.com/drive/u/1/folders/1NqkSefEZx0w88bNOLYoZdDU_JIEX5P-_', label: 'PLANES CON COPAGO', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1zDsHZoAQqTmGqv0LnxDyRuve24V0g7E6BtT40EyG8us/edit?gid=3622276#gid=3622276', label: 'Rangos de edad excluidos', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/10dZhGPjLzw4XxZQ3uZdNmQtUo64clE9jNnWBkkUKezQ/edit#gid=0', label: 'Protesis en Ambulatorio', target: '_blank' },
            { type: 'link', href: 'https://drive.google.com/file/d/1WrBLlnFoTYoWQhGw8ez83VCpn3d5h4-o/view?usp=sharing', label: 'Carga de CUD (Proceso)', target: '_blank' },
            { type: 'link', href: '/dashboard/user/nomencladorNU', label: 'Practicas por codigo NU y NB' },
            { type: 'link', href: '/dashboard/user/nomencladorNM', label: 'Practicas por codigo NM' }
          ]
        },
        {
          type: 'submenu',
          label: 'Vademecum',
          icon: Book,
          subDropdown: [
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1720VTYilXZxEHKnWYpq5R7x2hkswnGfd/edit?rtpof=true&sd=true&gid=2119192922#gid=2119192922', label: 'PMI Sustentable, C y OS', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1GDfmi_CBvcmeJZKWyKFtx6eGZqppraUOyFSqe0SBExE/edit?gid=1182941618#gid=1182941618', label: 'Salud Reproductiva', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1GeHNHLQjdRnzl2uI6eMVy0J5a5dxqBxFQiDAvVrCIZA/edit?gid=1361535532#gid=1361535532', label: 'Manual Farmaceutico', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/13R6tt3O36BfMeSDuSwfwzwi9dYP4FHhDEtj8rIBZ_Gw/edit?gid=2095242313#gid=2095242313', label: 'Cronicos', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1aj5NU2iU4NeIiLdhIcBAKUY4xMfhNrqm/edit?gid=1202509401#gid=1202509401', label: 'Sustentable', target: '_blank' },
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1UI_ihqmhAKsH9TOJ9E4b7Wjln9a5Vyav/edit?gid=1234629926#gid=1234629926', label: 'Leche Medicamentosa', target: '_blank' },
          ]
        },
        {
          type: 'link',
          label: 'Pizarra',
          icon: Grid,
          href: '/dashboard/user/foro'
        },
        {
          type: 'submenu',
          label: 'Otros',
          icon: BadgePlus,
          subDropdown: [
            { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1fyjXUOIYC1JqVFNvNyfTKs5uncUgqYFWPXpBc-sbg54/edit?gid=0#gid=0', label: 'Requisitos de Reintegros', target: '_blank' },
          { type: 'link', href: 'https://drive.google.com/file/d/1YyisLBTH1-vpHDsNB-u1VOvzc_DpGG_T/view?utm_admin=116921&pli=1', label: 'Reintegro Cobro Plus', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/spreadsheets/u/1/d/1_a9DEAVfE9DEzpgyw_6xxilQRgXRDXZv0FWq4Wlnm4w/edit?gid=0#gid=0', label: 'Mejoras plan F800', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1gOo19k_g8nB_WFcPkOunkL9J-CtUBNBdKO2AUQz5hIo/edit?gid=0#gid=0', label: 'falta de prestadores en zona por practicas', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/document/d/11CievaucFwk5HtAXkluA9e9J7pnmHBub/edit', label: 'Medios de Cobro', target: '_blank' },
          { type: 'link', href: '/dashboard/user/speech', label: 'Speech de corte' },
          { type: 'link', href: 'https://repo.sancorsalud.com.ar/webinstitucional/assets/pdf/comparti-salud/BasesCondicionesProgramaCompartiSalud2024V6.pdf', label: 'Campaña Comparti Salud', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/document/d/1W7UVMff4n0CSNdecZna-oydsttIYsAHL/edit', label: 'Glosario Calidad', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1VHQPVUZFEKlwGbe00q5sVK11WEDOqabY6l9FsfJ0vLs/edit?gid=760225460#gid=760225460', label: 'Tabulador CRM', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1yL12CvA2pcDi6O6F0GcVPt7FiJPX_dHBr6gZOpeihSE/edit?gid=644205541#gid=644205541', label: 'CAR Status', target: '_blank' },
          { type: 'link', href: 'https://docs.google.com/spreadsheets/d/10kRYSd2iyN0OFR2sLuaclPgNWbohmgh3RRhd0NhZqNE/edit?gid=0#gid=0', label: 'Motivos de rechazos Online', target: '_blank' },
          { type: 'link', href: 'https://forms.gle/z8NfFEZGnc5V6eKFA', label: 'Casos de VN', target: '_blank' },
        ]
      },
    ]
  }
] : [];

return (
  <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 dark:text-white shadow-sm">
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
        <div className="flex items-center space-x-4">
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
              {navLinksLeader.map((link, index) => (
                <div key={index} className="relative">
                  {isLinkItem(link) ? (
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
                        <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-all">
                          {link.icon && <link.icon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          {link.label}
                          <ChevronDown size={16} className="ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-64 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg"
                        align="end"
                      >
                        {link.dropdown?.map((item, dropdownIndex) => (
                          <div key={dropdownIndex}>
                            {isSubMenuItem(item) ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger 
                                  className="w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center justify-between"
                                >
                                  <span className="flex items-center">
                                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                    {item.label}
                                  </span>
                                  <ChevronRight className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  className="min-w-[200px]"
                                  side="right"
                                  sideOffset={-5}
                                >
                                  {item.subDropdown.map((subItem, subIndex) => (
                                    <DropdownMenuItem key={subIndex}>
                                      <Link
                                        href={subItem.href}
                                        target={subItem.target}
                                        className="flex items-center justify-between w-full"
                                      >
                                        <span>{subItem.label}</span>
                                        {subItem.target === '_blank' && (
                                          <ChevronRight className="ml-2 h-4 w-4" />
                                        )}
                                      </Link>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <DropdownMenuItem>
                                <Link
                                  href={item.href}
                                  className="w-full flex items-center justify-between"
                                  target={item.target}
                                >
                                  <span>{item.label}</span>
                                  {item.target === '_blank' && (
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                  )}
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
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
                casos reclamados
              </NavLink>
              <NavLink 
                href="/dashboard/team_leader/bienestar" 
                isActive={pathname === '/dashboard/team_leader/bienestar'}
                icon={Activity}
              >
                HiSancor
              </NavLink>
              <NavLink 
                href="/dashboard/team_leader/caseSeguimiento" 
                isActive={pathname === '/dashboard/team_leader/caseSeguimiento'}
                icon={FileText}
              >
                Casos
              </NavLink>
            </>
          )}

          {user.role.toLowerCase() === 'user' && (
            <>
              {navLinks.map((link, index) => (
                <div key={index} className="relative group">
                  {isLinkItem(link) ? (
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
                        <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-all">
                          {link.icon && <link.icon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          {link.label}
                          <ChevronDown size={16} className="ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-64 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg"
                        align="end"
                      >
                        {link.dropdown?.map((item, itemIndex) => (
                          <DropdownMenuItem 
                            key={itemIndex}
                            className="focus:bg-gray-100 dark:focus:bg-gray-800 rounded-md"
                          >
                            {isLinkItem(item) && (
                              <Link
                                href={item.href}
                                target={item.target}
                                className="flex items-center justify-between w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                              >
                                <span className="flex-1">{item.label}</span>
                                {item.target === '_blank' && (
                                  <ChevronRight className="ml-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                )}
                              </Link>
                            )}
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
      </div>
    </div>
  </nav>
);
};

export default ClientNavbar;