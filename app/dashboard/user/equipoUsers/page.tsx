'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Link as LinkIcon, Building2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Manager extends TeamMember {
  role: 'manager';
}

interface TeamLeader extends TeamMember {
  role: 'team_leader';
}

interface Team {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  managerId: number;
  teamLeaderId: number;
  grupoNovedades: string;
  grupoGeneral: string;
  manager: Manager;
  teamLeader: TeamLeader;
  members: TeamMember[];
}

interface APIResponse {
  data: Team[];
}

const TeamMembersView: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const teamsResponse = await fetch('/api/teams');
        const teamsData: APIResponse = await teamsResponse.json();
        
        if (!teamsResponse.ok) {
          throw new Error(`Error al cargar los equipos: ${teamsResponse.statusText}`);
        }

        if (!teamsData?.data || !Array.isArray(teamsData.data)) {
          throw new Error('El formato de datos de equipos es inválido');
        }

        setTeams(teamsData.data);
        
        if (teamsData.data.length > 0) {
          setSelectedTeam(teamsData.data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  if (isLoading && teams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-7xl mx-auto">
          <CardContent className="p-4">
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Cargando...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-7xl mx-auto shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Teams Selection */}
        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Seleccionar Equipo
            </CardTitle>
          </div>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 mt-2 pb-2">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <Button
                    key={team.id}
                    variant={selectedTeam?.id === team.id ? 'default' : 'outline'}
                    onClick={() => handleTeamSelect(team)}
                    className="whitespace-nowrap"
                  >
                    {team.name}
                  </Button>
                ))
              ) : (
                <div className="text-gray-600 dark:text-gray-400 p-2">
                  No hay equipos disponibles
                </div>
              )}
            </div>
          </ScrollArea>
        </CardHeader>

        {/* Team Links */}
        {selectedTeam && (
          <CardContent className="p-4">
            <Card className="mb-4 border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <LinkIcon className="mr-2 w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Links del Equipo: {selectedTeam.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {selectedTeam.grupoNovedades && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Grupo Novedades:</span>
                    <a 
                      href={selectedTeam.grupoNovedades} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {selectedTeam.grupoNovedades}
                    </a>
                  </div>
                )}
                {selectedTeam.grupoGeneral && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Grupo General:</span>
                    <a 
                      href={selectedTeam.grupoGeneral} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {selectedTeam.grupoGeneral}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        )}

        {/* Team Members */}
        {selectedTeam && (
          <CardContent className="p-4">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Miembros del Equipo
                    </CardTitle>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {selectedTeam.members.length + 2} {/* +2 por manager y team leader */}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Manager Card */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <UserCircle className="w-8 h-8 text-blue-600 dark:text-blue-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {selectedTeam.manager.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            Manager
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            {selectedTeam.manager.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Leader Card */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <UserCircle className="w-8 h-8 text-green-600 dark:text-green-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {selectedTeam.teamLeader.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            Team Leader
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            {selectedTeam.teamLeader.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Members Cards */}
                  {selectedTeam.members.map((member) => (
                    <Card key={member.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              Miembro del equipo
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}

        {/* Error Handling */}
        {error && (
          <CardContent className="p-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default TeamMembersView;