'use client'

import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
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
  if (teamLeaders.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
        No hay líderes de equipo registrados.
      </Card>
    );
  }

  return (
    <Card>
      <div className="relative overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-gray-800">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamLeaders.map((teamLeader) => (
              <TeamLeaderItem 
                key={teamLeader.id} 
                teamLeader={teamLeader} 
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default TeamLeaderList;