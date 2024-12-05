'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Link as LinkIcon, Building2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Team {
  id: number;
  name: string;
  grupoNovedades: string;
  grupoGeneral: string;
}

interface Nomina {
  id?: number;
  apellidoYNombre: string;
  cargo: string;
  servicio: string;
  usuarioOrion: string;
  teamId: number;
}

const TeamMembersView: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Nomina[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamsAndMembers = async () => {
      setIsLoading(true);
      try {
        const teamsResponse = await fetch('/api/teams');
        const teamsData = await teamsResponse.json();
        
        if (teamsResponse.ok) {
          setTeams(teamsData);
          
          if (teamsData.length > 0) {
            const firstTeam = teamsData[0];
            setSelectedTeam(firstTeam);
            
            const membersResponse = await fetch(`/api/nomina?teamId=${firstTeam.id}`);
            const membersData = await membersResponse.json();
            
            if (membersResponse.ok) {
              setTeamMembers(membersData);
            } else {
              setError('Error al cargar los miembros del equipo');
            }
          }
        } else {
          setError('Error al cargar los equipos');
        }
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamsAndMembers();
  }, []);

  const handleTeamSelect = async (team: Team) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nomina?teamId=${team.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedTeam(team);
        setTeamMembers(data);
        setError(null);
      } else {
        setError('Error al cargar los miembros del equipo');
      }
    } catch (err) {
      setError('Error al cargar los miembros del equipo');
    } finally {
      setIsLoading(false);
    }
  };

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
              {teams.map((team) => (
                <Button
                  key={team.id}
                  variant={selectedTeam?.id === team.id ? 'default' : 'outline'}
                  onClick={() => handleTeamSelect(team)}
                  className="whitespace-nowrap"
                >
                  {team.name}
                </Button>
              ))}
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
                {teamMembers.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {teamMembers.length}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  Cargando...
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No hay miembros en el equipo
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <Card key={member.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {member.apellidoYNombre}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {member.cargo}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {member.servicio}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                              {member.usuarioOrion}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>

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