// components/SurveyButton.tsx
'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface SurveyButtonProps {
  onClick: () => void;
  className?: string; 
}

export const SurveyButton: React.FC<SurveyButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-4 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 ${className}`}
    >
      <MessageCircle size={24} />
    </button>
  );
};

export default SurveyButton;
