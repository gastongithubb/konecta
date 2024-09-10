'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

type User = {
  id: number;
  name: string;
  role: string;
};

type ApiResponse = User | User[] | Record<string, User>;

const TeamCreationComponent: React.FC = () => {
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const leadersResponse = await fetch('/api/users?role=team_leader');
        const agentsResponse = await fetch('/api/users?role=agent');
        
        if (!leadersResponse.ok || !agentsResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const leadersData: ApiResponse = await leadersResponse.json();
        const agentsData: ApiResponse = await agentsResponse.json();

        console.log('Leaders data:', JSON.stringify(leadersData, null, 2));
        console.log('Agents data:', JSON.stringify(agentsData, null, 2));

        setDebug(prev => prev + `Leaders data: ${JSON.stringify(leadersData)}\n`);
        setDebug(prev => prev + `Agents data: ${JSON.stringify(agentsData)}\n`);

        const processUsers = (data: ApiResponse, role: string): User[] => {
          if (Array.isArray(data)) {
            return data.filter(user => user.role === role);
          } else if (typeof data === 'object' && data !== null) {
            return Object.values(data)
              .filter((user): user is User => user.role === role);
          }
          return [];
        };

        const processedLeaders = processUsers(leadersData, 'team_leader');
        const processedAgents = processUsers(agentsData, 'agent');

        setTeamLeaders(processedLeaders);
        setAgents(processedAgents);

        if (processedLeaders.length === 0) {
          setError('No se encontraron líderes de equipo. Por favor, contacte al administrador.');
        }
        if (processedAgents.length === 0) {
          setError(prev => prev ? `${prev} No se encontraron agentes.` : 'No se encontraron agentes. Por favor, contacte al administrador.');
        }

      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar usuarios. Por favor, intenta de nuevo más tarde.');
      }
    };
    loadUsers();
  }, []);

  const handleLeaderChange = (value: string) => {
    setSelectedLeader(value);
  };
  
  const handleAgentChange = (value: string) => {
    setSelectedAgents(prev =>
      prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
    );
  };  

  const handleSaveTeam = async () => {
    if (selectedLeader && selectedAgents.length > 0) {
      try {
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leaderId: selectedLeader,
            agentIds: selectedAgents
          }),
        });
        
        if (!response.ok) {
          throw new Error('Error al guardar el equipo');
        }
        
        alert('Equipo guardado exitosamente');
        // Aquí podrías resetear el formulario o redirigir al usuario
      } catch (error) {
        console.error('Error al guardar el equipo:', error);
        setError('Hubo un error al guardar el equipo. Por favor, intenta de nuevo.');
      }
    } else {
      setError('Por favor, selecciona un líder y al menos un agente');
    }
  };  

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Crear Nuevo Equipo</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        {teamLeaders.length > 0 ? (
          <div className="space-y-2">
            <label htmlFor="team-leader" className="text-sm font-medium text-gray-700">
              Líder del Equipo
            </label>
            <Select onValueChange={handleLeaderChange} value={selectedLeader}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un líder" />
              </SelectTrigger>
              <SelectContent>
                {teamLeaders.map((leader) => (
                  <SelectItem key={leader.id} value={String(leader.id)}>
                    {leader.name}
                  </SelectItem>                            
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-yellow-500">No hay líderes de equipo disponibles.</div>
        )}
        {agents.length > 0 ? (
          <div className="space-y-2">
            <label htmlFor="team-agents" className="text-sm font-medium text-gray-700">
              Agentes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selectedAgents.includes(String(agent.id)) ? "default" : "outline"}
                  onClick={() => handleAgentChange(String(agent.id))}
                  className="justify-start"
                >
                  {agent.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-yellow-500">No hay agentes disponibles.</div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveTeam} className="w-full" disabled={!selectedLeader || selectedAgents.length === 0}>
          Guardar Equipo
        </Button>
      </CardFooter>
      <pre>{debug}</pre>
    </Card>
  );
};

export default TeamCreationComponent;