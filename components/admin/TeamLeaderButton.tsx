'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

const TeamLeaderButton: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/team-leaders');
  };

  return (
    <button 
      onClick={handleClick} 
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Ver Team Leaders
    </button>
  );
};

export default TeamLeaderButton;