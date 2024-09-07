import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p>&copy; 2024 Telefónica. Todos los derechos reservados.</p>
          <div>
            <a href="#" className="hover:text-indigo-400 mr-4">Política de Privacidad</a>
            <a href="#" className="hover:text-indigo-400">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;