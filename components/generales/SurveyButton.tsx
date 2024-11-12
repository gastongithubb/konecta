// components/SurveyButton.tsx
'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface SurveyButtonProps {
  onClick: () => void;
}

export const SurveyButton: React.FC<SurveyButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 z-50 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
      aria-label="Abrir encuesta de bienestar"
    >
      <MessageCircle size={24} />
    </button>
  );
};

export default SurveyButton;
