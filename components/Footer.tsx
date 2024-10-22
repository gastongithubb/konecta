// components/Footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { SurveyButton } from './SurveyButton';
import SurveyModal from './SurveyModal';
import type { SurveyData } from '@/types/survey';

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

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

  const handleSurveySubmit = async (surveyData: SurveyData) => {
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la encuesta');
      }

      console.log('Encuesta enviada con éxito');
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

      <SurveyButton onClick={() => setIsSurveyOpen(true)} />
      <SurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        onSubmit={handleSurveySubmit}
      />
    </>
  );
};

export default Footer;