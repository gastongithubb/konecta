'use client';

import React from 'react';
import { LightbulbIcon } from 'lucide-react';
import { useTheme } from "next-themes";

const SugerenciasUX: React.FC = () => {
  const { theme } = useTheme();
  
  const handleSubmit = () => {
    window.open('https://forms.gle/vDeJAjvuEo8den439', '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <div className="relative group">
        {/* Card background with hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl opacity-50 transition-all duration-500 dark:from-orange-600/10 dark:to-purple-600/10" />
        
        {/* Main card */}
        <div className="relative bg-white dark:bg-gray-800 shadow-lg dark:shadow-purple-500/5 rounded-lg overflow-hidden transition-all duration-300">
          <div className="px-6 py-4">
            {/* Title section */}
            <div className="flex items-center text-2xl font-bold text-orange-500 dark:text-orange-400 mb-4 group">
              <LightbulbIcon className="mr-2 group-hover:animate-pulse transition-all" />
              <span className="bg-gradient-to-r from-orange-500 to-purple-500 dark:from-orange-400 dark:to-purple-400 bg-clip-text text-transparent">
                UX
              </span>
            </div>

            {/* Content */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors">
              ¿Tienes ideas para mejorar?
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300 transition-colors">
              Nos encantaría escuchar tus sugerencias para mejorar nuestra plataforma.
            </p>

            {/* Button */}
            <button 
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 
                hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 
                text-white font-bold py-2 px-4 rounded-lg 
                transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-opacity-50
                shadow-md hover:shadow-lg"
            >
              Comparte tu idea aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SugerenciasUX;