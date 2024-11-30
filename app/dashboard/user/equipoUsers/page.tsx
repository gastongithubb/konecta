'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Fetch teams and team members
  useEffect(() => {
    const fetchTeamsAndMembers = async () => {
      try {
        // Fetch teams
        const teamsResponse = await fetch('/api/teams');
        const teamsData = await teamsResponse.json();
        
        if (teamsResponse.ok) {
          setTeams(teamsData);
          
          // If teams exist, fetch members of the first team by default
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
      }
    };

    fetchTeamsAndMembers();
  }, []);

  // Handle team selection
  const handleTeamSelect = async (team: Team) => {
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
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-7xl mx-auto shadow-lg">
        {/* Teams Selection */}
        <CardHeader className="bg-gray-50 border-b p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800">
              Seleccionar Equipo
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {teams.map((team) => (
              <Button
                key={team.id}
                variant={selectedTeam?.id === team.id ? 'default' : 'outline'}
                onClick={() => handleTeamSelect(team)}
              >
                {team.name}
              </Button>
            ))}
          </div>
        </CardHeader>

        {/* Team Links */}
        {selectedTeam && (
          <CardContent className="p-4">
            <Card className="mb-4">
              <CardHeader className="bg-gray-50 border-b p-4">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  <LinkIcon className="mr-2 w-6 h-6 text-primary" />
                  Links del Equipo: {selectedTeam.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {selectedTeam.grupoNovedades && (
                  <div>
                    <strong>Grupo Novedades:</strong>{' '}
                    <a 
                      href={selectedTeam.grupoNovedades} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {selectedTeam.grupoNovedades}
                    </a>
                  </div>
                )}
                {selectedTeam.grupoGeneral && (
                  <div>
                    <strong>Grupo General:</strong>{' '}
                    <a 
                      href={selectedTeam.grupoGeneral} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
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
          <Card>
            <CardHeader className="bg-gray-50 border-b p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800">
                  Miembros del Equipo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {teamMembers.length === 0 ? (
                <div className="text-center text-gray-500 text-sm sm:text-base">
                  No hay miembros en el equipo
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {teamMembers.map((member) => (
                    <Card key={member.id} className="shadow-md">
                      <CardContent className="p-3 sm:p-4">
                        <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                          {member.apellidoYNombre}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {member.cargo} - {member.servicio}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.usuarioOrion}
                        </p>
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
          <div className="p-4 bg-red-50 text-red-600">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeamMembersView;