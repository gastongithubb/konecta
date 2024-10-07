'use client';

import React from 'react';
import { LightbulbIcon } from 'lucide-react';

const SugerenciasUX: React.FC = () => {
  const handleSubmit = () => {
    window.open('https://forms.gle/vDeJAjvuEo8den439', '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <div className="flex items-center text-2xl font-bold text-orange-500 mb-4">
          <LightbulbIcon className="mr-2" />
          <span>UX</span>
        </div>
        <h2 className="text-lg font-semibold mb-4">¿Tienes ideas para mejorar?</h2>
        <p className="mb-4 text-gray-600">Nos encantaría escuchar tus sugerencias para mejorar nuestra plataforma.</p>
        <button 
          onClick={handleSubmit}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Comparte tu idea aquí
        </button>
      </div>
    </div>
  );
};

export default SugerenciasUX;