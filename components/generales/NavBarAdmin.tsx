// components/generales/NavBarAdmin.tsx
import React from 'react';
import { getSession } from '@/app/lib/auth.server';
import ClientNavbar from './ClientNavbar';

interface NavbarAdminProps {
  shouldRedirect?: boolean;
}

const NavbarAdmin = ({ shouldRedirect = false }: NavbarAdminProps) => {
  return <ClientNavbar />;
};

export default NavbarAdmin;