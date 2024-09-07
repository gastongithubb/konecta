// components/admin/TeamLeaderList.tsx
'use client'
import React from 'react';
import TeamLeaderItem from './TeamLeaderItem';

interface TeamLeader {
  id: number;
  name: string;
  email: string;
}

interface TeamLeaderListProps {
  teamLeaders: TeamLeader[];
}

const TeamLeaderList: React.FC<TeamLeaderListProps> = ({ teamLeaders }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teamLeaders.map((teamLeader) => (
            <TeamLeaderItem key={teamLeader.id} teamLeader={teamLeader} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamLeaderList;