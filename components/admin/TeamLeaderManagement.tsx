import React from 'react';
import TeamLeaderButton from './TeamLeaderButton';

const TeamLeaderManagement: React.FC = () => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Gestión de Team Leaders</h2>
      <TeamLeaderButton />
    </div>
  );
};

export default TeamLeaderManagement;