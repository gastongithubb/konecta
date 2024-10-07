'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ChevronRight } from 'lucide-react';

const TeamLeaderButton: React.FC = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    router.push('/dashboard/team-leaders');
  };

  return (
    <button 
      onClick={handleClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        flex items-center justify-center
        bg-gradient-to-r from-blue-500 to-blue-600
        hover:from-blue-600 hover:to-blue-700
        text-white font-semibold
        py-3 px-6 rounded-lg
        shadow-md hover:shadow-lg
        transition duration-300 ease-in-out
        transform hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      "
    >
      <Users className="mr-2 h-5 w-5" />
      <span>Ver Líderes</span>
      <ChevronRight 
        className={`ml-2 h-5 w-5 transition-transform duration-300 ${
          isHovered ? 'translate-x-1' : ''
        }`} 
      />
    </button>
  );
};

export default TeamLeaderButton;