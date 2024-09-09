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

// Definimos los tipos para nuestros usuarios
type User = {
  id: number;
  name: string;
};

// Importamos las funciones de la API
import { fetchTeamLeaders, fetchAgents, saveTeam } from '@/app/api/teams/route';

const TeamCreationComponent: React.FC = () => {
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const leaders = await fetchTeamLeaders();
        const agentList = await fetchAgents();
        setTeamLeaders(leaders);
        setAgents(agentList);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
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
        await saveTeam({
          leaderId: selectedLeader,
          agentIds: selectedAgents
        });
        alert('Equipo guardado exitosamente');
        // Aquí podrías resetear el formulario o redirigir al usuario
      } catch (error) {
        console.error('Error al guardar el equipo:', error);
        alert('Hubo un error al guardar el equipo');
      }
    } else {
      alert('Por favor, selecciona un líder y al menos un agente');
    }
  };  

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Crear Nuevo Equipo</h2>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveTeam} className="w-full">
          Guardar Equipo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamCreationComponent;