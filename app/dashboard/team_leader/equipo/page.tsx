'use client'
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Link, Trash2, PencilLine, UserRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Team {
  id: number;
  name: string;
  chatLink?: string;
  manager: TeamMember;
  teamLeader: TeamMember;
  members: TeamMember[];
}

const TeamComponent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [chatLink, setChatLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const response = await fetch('/api/teams');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar el equipo');
      }
      const teamData = await response.json();

      setTeam(teamData.data);
      setChatLink(teamData.data.chatLink || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar la información del equipo';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChatLink = async () => {
    if (!team) return;

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: team.name,
          chatLink,
          teamLeaderId: team.teamLeader.id,
          memberIds: team.members.map(m => m.id)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el enlace');
      }

      setIsEditing(false);
      toast({
        title: "Actualizado",
        description: "Enlace de chat actualizado correctamente"
      });

      fetchTeam();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el enlace de chat';
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      });
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el equipo');
      }

      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado correctamente"
      });

      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el equipo';
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  if (!session?.user) return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="flex items-center justify-center p-6">
        <div className="text-gray-500">Debes iniciar sesión para ver esta página</div>
      </CardContent>
    </Card>
  );

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (error) return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="flex items-center justify-center p-6">
        <div className="text-red-500 flex items-center gap-2">
          <span className="rounded-full bg-red-100 p-2">
            <Trash2 className="h-4 w-4" />
          </span>
          {error}
        </div>
      </CardContent>
    </Card>
  );

  if (!team) return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="flex items-center justify-center p-6">
        <div className="text-gray-500">No se encontró el equipo</div>
      </CardContent>
    </Card>
  );

  const canEdit = session.user?.role === 'manager' ||
    (session.user?.role === 'team_leader' && session.user.id === team.teamLeader.id);
  const canDelete = session.user?.role === 'manager' ||
    (session.user?.role === 'team_leader' && session.user.id === team.teamLeader.id);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            {team.name}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="ml-2">
                  {team.members.length} miembros
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total de miembros en el equipo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          Líder: {team.teamLeader.name}
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{team.teamLeader.email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Chat Link Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Link className="h-5 w-5" />
              Enlace de Google Chat
            </h3>

            {isEditing && canEdit ? (
              <div className="flex gap-2">
                <Input
                  value={chatLink}
                  onChange={(e) => setChatLink(e.target.value)}
                  placeholder="https://chat.google.com/..."
                  className="flex-1"
                />
                <Button onClick={updateChatLink}>Guardar</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setChatLink(team.chatLink || '');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {team.chatLink ? (
                  <>
                    <a
                      href={team.chatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex-1 truncate"
                    >
                      {team.chatLink}
                    </a>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : canEdit ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Agregar enlace de chat
                  </Button>
                ) : (
                  <span className="text-gray-500">No hay enlace de chat configurado</span>
                )}
              </div>
            )}
          </div>

          {/* Team Members Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Miembros del Equipo</h3>
            <div className="space-y-3">
              {/* Team Leader Card */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <UserRound className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{team.teamLeader.name}</div>
                    <div className="text-sm text-gray-500">{team.teamLeader.email}</div>
                  </div>
                  <Badge>Líder</Badge>
                </div>
              </div>

              {/* Team Members */}
              <div className="grid gap-2">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 rounded-full p-2">
                        <UserRound className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Manager:</span>
          <span className="font-medium">{team.manager.name}</span>
        </div>

        {canDelete && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el equipo y todas sus asociaciones.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTeam}
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default TeamComponent;