'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Users, UserMinus } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'team_leader';
}

interface Team {
  id: number;
  name: string;
  manager: User;
  teamLeader: User;
  members: User[];
}

const TeamManagement = () => {
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user as User | undefined;

  const hasPermission = (user?: User) => {
    return user?.role === 'manager' || user?.role === 'team_leader';
  };

  const canManageTeam = (user?: User, team?: Team) => {
    if (!user || !team) return false;
    return user.role === 'manager' || 
           (user.role === 'team_leader' && user.id === team.teamLeader.id);
  };

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      if (response.ok) {
        let filteredTeams = data.data;
        
        if (user?.role === 'team_leader') {
          filteredTeams = data.data.filter((team: Team) => team.teamLeader.id === user.id);
        }
        
        setTeams(filteredTeams);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.id]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!user) {
      setError('No se encontró información del usuario');
      setLoading(false);
      return;
    }

    if (!hasPermission(user)) {
      setError('No tienes permisos para acceder a esta sección');
      setLoading(false);
      return;
    }

    fetchTeams();
  }, [status, user, fetchTeams]);

  const handleDeleteTeam = async (teamId: number) => {
    if (!user) return;

    try {
      const team = teams.find(t => t.id === teamId);
      if (!team || !canManageTeam(user, team)) {
        setError('No tienes permisos para eliminar este equipo');
        return;
      }

      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTeams(teams.filter(team => team.id !== teamId));
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Error al eliminar el equipo');
    }
  };

  const handleRemoveMember = async (teamId: number, memberId: number) => {
    if (!user) return;

    try {
      const team = teams.find(t => t.id === teamId);
      if (!team || !canManageTeam(user, team)) {
        setError('No tienes permisos para modificar este equipo');
        return;
      }

      const updatedMembers = team.members.filter(m => m.id !== memberId);
      
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: team.name,
          teamLeaderId: team.teamLeader.id,
          memberIds: updatedMembers.map(m => m.id)
        }),
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams(prevTeams => 
          prevTeams.map(t => t.id === teamId ? updatedTeam.data : t)
        );
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Error al remover el miembro');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  if (!user || !hasPermission(user)) {
    return <div className="text-red-500 p-4">No tienes permisos para acceder a esta sección</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {teams.map((team: Team) => (
        <Card key={team.id} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
              <div className="text-sm text-gray-500">
                <p>Manager: {team.manager.name}</p>
                <p>Team Leader: {team.teamLeader.name}</p>
              </div>
            </div>
            {canManageTeam(user, team) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente el equipo y no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold">Miembros ({team.members.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {team.members.map((member: User) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    {canManageTeam(user, team) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Remover miembro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro que deseas remover a {member.name} del equipo?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMember(team.id, member.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeamManagement;
