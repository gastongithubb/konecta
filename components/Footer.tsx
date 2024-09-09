'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/legacy/image";
import Link from 'next/link';

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const handleScroll = () => {
      if (window.scrollY > 300 && !showWhatsAppPopup && !hasShownPopup) {
        setShowWhatsAppPopup(true);
        setHasShownPopup(true);
        setTimeout(() => setShowWhatsAppPopup(false), 5000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showWhatsAppPopup, hasShownPopup]);

  return (
    <>
      <footer className="bg-[#f5f5f5] text-zinc-900 font-SpaceGrotesk">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-6">
            <div className="mb-4 md:mb-0">
              <Image src="/logo-footer.png" alt="Logo" width={200} height={50} className="w-44" />
            </div>
            <div className="text-center md:text-right">
              <p>© {currentYear} Administración y Soporte <em>Gastón Alvarez</em></p>
              <p>Hecho con <Link href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="underline transition-colors duration-300 hover:text-gray-600">Next.js</Link></p>
              <p className="mt-2">
                <Link href="/privacy-policy" className="underline transition-colors duration-300 hover:text-gray-600">
                  Política de Privacidad
                </Link> 
                {' | '}
                <Link href="/terms-of-service" className="underline transition-colors duration-300 hover:text-gray-600">
                  Condiciones del Servicio
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
