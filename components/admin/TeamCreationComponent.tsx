'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Users, UserPlus, User } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReloadIcon } from "@radix-ui/react-icons";

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
  teamId: number | null;
}

interface Equipo {
  id: number;
  name: string;
  teamLeader: Usuario;
  members: Usuario[];
}

const ComponenteGestionEquipos: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [lideresEquipo, setLideresEquipo] = useState<Usuario[]>([]);
  const [agentes, setAgentes] = useState<Usuario[]>([]);
  const [agentesFiltrados, setAgentesFiltrados] = useState<Usuario[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [nombreEquipo, setNombreEquipo] = useState<string>('');
  const [liderSeleccionado, setLiderSeleccionado] = useState<string>('');
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const canCreateTeam = currentUser?.role === 'manager' || currentUser?.role === 'team_leader';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/user');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Error al obtener información del usuario');
        }
  
        const userData = await response.json();
        
        if (userData.user) {
          setCurrentUser(userData.user);
          
          const [usuariosRes, equiposRes] = await Promise.all([
            fetch('/api/agents'),
            fetch('/api/teams')
          ]);
  
          if (!usuariosRes.ok || !equiposRes.ok) {
            throw new Error('Error en la respuesta del servidor');
          }
  
          const usuariosData = await usuariosRes.json();
          const equiposData = await equiposRes.json();
  
          const todosUsuarios = usuariosData.data || [];
          
          if (userData.user.role === 'team_leader') {
            setLideresEquipo([userData.user]);
            setLiderSeleccionado(String(userData.user.id));
          } else {
            const lideresDisponibles = todosUsuarios.filter(
              (u: Usuario) => u.role === 'team_leader' && !u.teamId
            );
            setLideresEquipo(lideresDisponibles);
          }
          
          const agentesDisponibles = todosUsuarios.filter(
            (u: Usuario) => u.role === 'user' && !u.teamId
          );
          setAgentes(agentesDisponibles);
          setAgentesFiltrados(agentesDisponibles);
          
          setEquipos(equiposData.data?.teams || []);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar datos. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [router]);

  useEffect(() => {
    const filteredAgents = agentes.filter(agente => 
      agente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAgentesFiltrados(filteredAgents);
  }, [searchTerm, agentes]);

  const manejarCambioLider = (valor: string) => {
    setLiderSeleccionado(valor);
  };
  
  const manejarCambioMiembro = (valor: string) => {
    setMiembrosSeleccionados(prev =>
      prev.includes(valor) ? prev.filter(id => id !== valor) : [...prev, valor]
    );
  };  

  const manejarGuardarEquipo = async () => {
    if (!currentUser) {
      setError('No hay usuario autenticado');
      return;
    }
  
    if (!nombreEquipo.trim()) {
      setError('Por favor, ingrese un nombre para el equipo');
      return;
    }
  
    if (!liderSeleccionado) {
      setError('Por favor, seleccione un líder de equipo');
      return;
    }
  
    if (miembrosSeleccionados.length === 0) {
      setError('Por favor, seleccione al menos un miembro para el equipo');
      return;
    }
  
    try {
      const requestBody = {
        name: nombreEquipo.trim(),
        teamLeaderId: currentUser.role === 'team_leader' ? currentUser.id : liderSeleccionado,
        managerId: currentUser.role === 'team_leader' ? null : currentUser.id,
        memberIds: miembrosSeleccionados,
        grupoNovedades: "",
        grupoGeneral: ""
      };
  
      const respuesta = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error || 'Error al guardar el equipo');
      }
      
      const { data: nuevoEquipo } = await respuesta.json();
      setEquipos(prev => [...prev, nuevoEquipo]);
      setExito('Equipo guardado exitosamente');
      
      setNombreEquipo('');
      if (currentUser?.role === 'manager') {
        setLiderSeleccionado('');
      }
      setMiembrosSeleccionados([]);
      setError(null);
      
      setAgentes(prev => prev.filter(agente => 
        !miembrosSeleccionados.includes(String(agente.id))
      ));
      setSearchTerm('');
    } catch (error) {
      console.error('Error al guardar el equipo:', error);
      setError(error instanceof Error ? error.message : 'Hubo un error al guardar el equipo. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <ReloadIcon className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cargando información...
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[60px] rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t dark:border-gray-800 pt-6">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              No se pudo cargar la información del usuario. Por favor, recarga la página.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!canCreateTeam) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              No tienes permisos para gestionar equipos. Esta función está reservada para managers y líderes de equipo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card dark:bg-gray-900 border dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle>Gestión de Equipos</CardTitle>
        </div>
        <CardDescription>
          Administra los equipos y sus miembros
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="dark:bg-red-900/20 dark:text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {exito && (
          <Alert variant="default" className="dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
            <AlertDescription>{exito}</AlertDescription>
          </Alert>
        )}
        
        <Accordion type="single" collapsible className="w-full dark:border-gray-800">
          <AccordionItem value="equipos-existentes" className="dark:border-gray-800">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Equipos Existentes</span>
                <Badge variant="secondary" className="ml-2">
                  {equipos.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[300px] rounded-md border dark:border-gray-800 p-4">
                {equipos.length > 0 ? (
                  equipos.map((equipo) => (
                    <div key={equipo.id} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold dark:text-gray-200">{equipo.name}</h4>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2 text-sm dark:text-gray-400">
                          <User className="h-4 w-4" />
                          <span>Líder: {equipo.teamLeader?.name || 'No asignado'}</span>
                        </div>
                        <div className="pl-6">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Miembros:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {equipo.members?.map((miembro) => (
                              <Badge 
                                key={miembro.id} 
                                variant="outline"
                                className="justify-start dark:border-gray-700"
                              >
                                {miembro.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4 dark:bg-gray-800" />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">No hay equipos existentes.</p>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <h3 className="text-xl font-semibold dark:text-gray-200">Crear Nuevo Equipo</h3>
          </div>
          
          <div className="space-y-4 border dark:border-gray-800 rounded-lg p-4">
            <div className="space-y-2">
              <label htmlFor="team-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Equipo
              </label>
              <Input
                id="team-name"
                value={nombreEquipo}
                onChange={(e) => setNombreEquipo(e.target.value)}
                placeholder="Ingrese el nombre del equipo"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            {currentUser.role === 'manager' && (
              <div className="space-y-2">
                <label htmlFor="team-leader" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Líder del Equipo
                </label>
                <Select onValueChange={manejarCambioLider} value={liderSeleccionado}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="Selecciona un líder" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {lideresEquipo.map((lider) => (
                      <SelectItem 
                        key={lider.id} 
                        value={String(lider.id)}
                        className="dark:text-gray-200 dark:focus:bg-gray-800"
                      >
                        {lider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lideresEquipo.length === 0 && (
                  <p className="text-yellow-600 dark:text-yellow-500">
                    No hay líderes de equipo disponibles.
                  </p>
                )}
              </div>
            )}
          
            <div className="space-y-4">
              <label htmlFor="team-members" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Miembros del Equipo
              </label>
              <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar agentes por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <ScrollArea className="h-[200px] rounded-md border dark:border-gray-800 p-4">
                <div className="grid grid-cols-2 gap-2">
                  {agentesFiltrados.map((agente) => (
                    <Button
                      key={agente.id}
                      variant={miembrosSeleccionados.includes(String(agente.id)) ? "default" : "outline"}
                      onClick={() => manejarCambioMiembro(String(agente.id))}
                      className="justify-start h-auto py-2 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <div className="text-left">
                        <div className="font-medium">{agente.name}</div>
                        <div className="text-xs opacity-70">{agente.email}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                {agentes.length === 0 ? (
                  <p className="text-center text-yellow-600 dark:text-yellow-500">
                    No hay agentes disponibles.
                  </p>
                ) : agentesFiltrados.length === 0 && (
                  <p className="text-center text-yellow-600 dark:text-yellow-500">
                    No se encontraron agentes con ese criterio de búsqueda.
                  </p>
                )}
              </ScrollArea>
              {miembrosSeleccionados.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Agentes seleccionados: {miembrosSeleccionados.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {miembrosSeleccionados.map((id) => {
                      const agente = agentes.find(a => String(a.id) === id);
                      return agente ? (
                        <Badge 
                          key={id}
                          variant="secondary" 
                          className="dark:bg-gray-800 dark:text-gray-200"
                        >
                          {agente.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t dark:border-gray-800 pt-6">
        <Button 
          onClick={manejarGuardarEquipo} 
          className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          disabled={!nombreEquipo.trim() || !liderSeleccionado || miembrosSeleccionados.length === 0}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {miembrosSeleccionados.length > 0 
            ? `Guardar Equipo con ${miembrosSeleccionados.length} miembro${miembrosSeleccionados.length === 1 ? '' : 's'}`
            : 'Guardar Equipo'
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComponenteGestionEquipos;