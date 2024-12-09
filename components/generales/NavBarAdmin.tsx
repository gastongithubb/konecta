import React from 'react';
import { authenticateRequest } from '@/app/lib/auth.server';
import ClientNavbar from './ClientNavbar';

const NavbarAdmin = async () => {
  try {
    const user = await authenticateRequest();

    if (!user) {
      return null;
    }

    return <ClientNavbar user={user} />;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

export default NavbarAdmin;