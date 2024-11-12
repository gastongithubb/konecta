import React from 'react';
import { authenticateRequest } from '@/app/lib/auth.server';
import ClientNavbar from './ClientNavbar';

const NavbarAdmin = async () => {
  try {
    const user = await authenticateRequest();

    if (!user) {
      // Si no hay usuario autenticado, podrías redirigir a la página de login
      // o mostrar un componente diferente
      return null;
    }

    return <ClientNavbar user={user} />;
  } catch (error) {
    console.error('Error authenticating user:', error);
    // Manejar el error apropiadamente, tal vez mostrando un mensaje de error
    return null;
  }
};

export default NavbarAdmin;