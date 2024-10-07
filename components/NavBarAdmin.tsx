// components/NavBarAdmin.tsx

import React from 'react';
import { authenticateRequest } from '@/app/lib/auth.server';
import ClientNavbar from './ClientNavbar';

const NavbarAdmin = async () => {
  const user = await authenticateRequest();

  if (!user) {
    return null;
  }

  return <ClientNavbar user={user} />;
};

export default NavbarAdmin;