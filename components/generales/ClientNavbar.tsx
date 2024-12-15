'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logoutClient } from '@/app/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, ChevronDown, Menu, User, Users, Calendar, Activity, FileText, Wrench, Book, Grid, ChevronRight, BadgePlus } from 'lucide-react';
import { useTheme } from "next-themes";
import { ThemeToggle } from '@/components/ThemeProvider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LucideIcon } from 'lucide-react';
import { useSession } from '@/app/SessionProvider';

// Interfaces base
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isPasswordChanged: boolean;
  teamId: number | null;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  teamId: number | null;
}

// Menu interfaces
interface BaseMenuItem {
  label: string;
  icon?: LucideIcon;
  target?: string;
}

interface LinkItem extends BaseMenuItem {
  type: 'link';
  href: string;
}

interface SubMenuDropdownItem extends BaseMenuItem {
  type: 'submenu';
  subDropdown: LinkItem[];
}

type DropdownItem = LinkItem | SubMenuDropdownItem;

interface NavLink extends BaseMenuItem {
  type: 'link' | 'dropdown';
  href?: string;
  dropdown?: DropdownItem[];
}

// Type guards
function isSubMenuItem(item: DropdownItem | NavLink): item is SubMenuDropdownItem {
  return item.type === 'submenu';
}

function isLinkItem(item: DropdownItem | NavLink): item is LinkItem {
  return item.type === 'link' && 'href' in item;
}

function isNavLinkWithDropdown(item: NavLink): item is NavLink & { type: 'dropdown'; dropdown: DropdownItem[] } {
  return item.type === 'dropdown' && !!item.dropdown;
}

// Componentes auxiliares
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

const UserInitials: React.FC<UserInitialsProps> = ({ name, className }) => {
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
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
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      } ${className || ''}`}
  >
    {Icon && <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />}
    {children}
  </Link>
);

const ClientNavbar: React.FC = () => {
  const session = useSession();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleLogout = async () => {
    try {
      await logoutClient();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Loading state
  if (!mounted) {
    return (
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-[120px] h-[40px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Public navbar for unauthenticated users
  if (!session) {
    return (
      <nav className="fixed w-full top-0 z-50 transition-all duration-300">
        <div className="absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-gray-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                <Image
                  src={theme === 'dark' ? "/Logo-dark.png" : "/Logo.webp"}
                  alt="Logo"
                  width={120}
                  height={40}
                  priority
                  className="mr-2 dark:brightness-200"
                  unoptimized
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const dashboardLink = `/dashboard/${session.role.toLowerCase()}`;

  const navLinks: NavLink[] = session.role.toLowerCase() === 'user' ? [
    {
      type: 'dropdown',
      label: 'Servicio',
      icon: Activity,
      dropdown: [
        { type: 'link', href: '/metrics', label: 'Metricas' },
        { type: 'link', href: '/team-monitoring/view', label: 'Calidad' },
        // { type: 'link', href: '/balance-mensual', label: 'Balance Mensual' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Herramientas',
      icon: Wrench,
      dropdown: [
        { type: 'link', href: '/dashboard/user/cases', label: 'Formulario F4' },
        { type: 'link', href: '/dashboard/user/sla', label: 'SLA' },
        { type: 'link', href: '/incidents', label: 'Tickets' },
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
        { type: 'link', href: 'https://repo.sancorsalud.com.ar/webinstitucional/assets/pdf/comparti-salud/BasesCondicionesProgramaCompartiSalud2024V6.pdf', label: 'Campaña Comparti Salud', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/document/d/1W7UVMff4n0CSNdecZna-oydsttIYsAHL/edit', label: 'Glosario Calidad', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1VHQPVUZFEKlwGbe00q5sVK11WEDOqabY6l9FsfJ0vLs/edit?gid=760225460#gid=760225460', label: 'Tabulador CRM', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/1yL12CvA2pcDi6O6F0GcVPt7FiJPX_dHBr6gZOpeihSE/edit?gid=644205541#gid=644205541', label: 'CAR Status', target: '_blank' },
        { type: 'link', href: 'https://docs.google.com/spreadsheets/d/10kRYSd2iyN0OFR2sLuaclPgNWbohmgh3RRhd0NhZqNE/edit?gid=0#gid=0', label: 'Motivos de rechazos Online', target: '_blank' },
        { type: 'link', href: 'https://forms.gle/z8NfFEZGnc5V6eKFA', label: 'Casos de VN', target: '_blank' },

      ]
    },
  ] : [];

  const navLinksLeader: NavLink[] = session.role.toLowerCase() === 'team_leader' ? [
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
            { type: 'link', href: '/metrics', label: 'Metricas' },
            { type: 'link', href: '/team-monitoring/view', label: 'Calidad' },
            // { type: 'link', href: '/balance-mensual', label: 'Balance Mensual' },
          ]
        },
        {
          type: 'submenu',
          label: 'Herramientas',
          icon: Wrench,
          subDropdown: [
            { type: 'link', href: '/dashboard/user/cases', label: 'Formulario F4' },
            { type: 'link', href: '/dashboard/user/sla', label: 'SLA' },
            { type: 'link', href: '/incidents', label: 'Tickets' },
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
    },

    {
      type: 'dropdown',
      label: 'Herramientas',
      icon: Wrench,
      dropdown: [
        { type: 'link', href: '/dashboard/team_leader/caseSeguimiento', label: 'Derivar/Finalizar' },
        { type: 'link', href: '/dashboard/team_leader/caselist', label: 'Reclamos F4' },
        { type: 'link', href: '/team-monitoring', label: 'Calidad' }
      ]
    }
  ] : [];

  // Main navbar render
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 dark:text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={dashboardLink} className="flex items-center">
              <Image
                src={theme === 'dark' ? "/Logo-dark.png" : "/Logo.webp"}
                alt="Logo"
                width={120}
                height={40}
                priority
                className="mr-2 dark:brightness-200"
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            {session.role.toLowerCase() === 'manager' && (
              <>
                <NavLink
                  href="/incidents"
                  isActive={pathname === '/incidents'}
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

            {/* Team Leader Navigation */}
            {session.role.toLowerCase() === 'team_leader' && (
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
                  href="/dashboard/team_leader/bienestar"
                  isActive={pathname === '/dashboard/team_leader/bienestar'}
                  icon={Activity}
                >
                  HiSancor
                </NavLink>
              </>
            )}

            {/* User Navigation */}
            {session.role.toLowerCase() === 'user' && (
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

          {/* Right side items - Theme Toggle and User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                    {session.name}
                  </span>
                  <UserInitials name={session.name} />
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
                {session.role.toLowerCase() === 'user' && (
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
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