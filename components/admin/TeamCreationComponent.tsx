'use client'
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Usuario = {
  id: number;
  name: string;
  email: string;
  role: string;
  teamId: number | null;
};

type Equipo = {
  id: number;
  name: string;
  teamLeader: Usuario;
  members: Usuario[];
};

const ComponenteGestionEquipos: React.FC = () => {
  const [lideresEquipo, setLideresEquipo] = useState<Usuario[]>([]);
  const [agentes, setAgentes] = useState<Usuario[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [liderSeleccionado, setLiderSeleccionado] = useState<string>('');
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, equiposRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/teams')
        ]);

        if (!usuariosRes.ok || !equiposRes.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const usuariosData = await usuariosRes.json();
        const equiposData = await equiposRes.json();

        const todosUsuarios = usuariosData || [];
        setLideresEquipo(todosUsuarios.filter((u: Usuario) => u.role === 'team_leader'));
        setAgentes(todosUsuarios.filter((u: Usuario) => u.role === 'user'));
        
        setEquipos(equiposData.data?.teams || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar datos. Por favor, intente de nuevo.');
      }
    };

    fetchData();
  }, []);

  const manejarCambioLider = (valor: string) => {
    setLiderSeleccionado(valor);
  };
  
  const manejarCambioMiembro = (valor: string) => {
    setMiembrosSeleccionados(prev =>
      prev.includes(valor) ? prev.filter(id => id !== valor) : [...prev, valor]
    );
  };  

  const manejarGuardarEquipo = async () => {
    if (liderSeleccionado && miembrosSeleccionados.length > 0) {
      try {
        const respuesta = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamLeaderId: liderSeleccionado,
            memberIds: miembrosSeleccionados
          }),
        });
        
        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.error || 'Error al guardar el equipo');
        }
        
        const { data: nuevoEquipo } = await respuesta.json();
        setEquipos(prev => [...prev, nuevoEquipo]);
        setExito('Equipo guardado exitosamente');
        setLiderSeleccionado('');
        setMiembrosSeleccionados([]);
        setError(null);
      } catch (error) {
        console.error('Error al guardar el equipo:', error);
        setError(error instanceof Error ? error.message : 'Hubo un error al guardar el equipo. Por favor, intenta de nuevo.');
      }
    } else {
      setError('Por favor, selecciona un líder y al menos un miembro');
    }
  }; 

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {exito && <Alert variant="default" className="bg-green-100 text-green-800 border-green-300"><AlertDescription>{exito}</AlertDescription></Alert>}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="equipos-existentes">
            <AccordionTrigger>Equipos Existentes</AccordionTrigger>
            <AccordionContent>
              {equipos.length > 0 ? (
                equipos.map((equipo) => (
                  <Accordion type="single" collapsible className="w-full" key={equipo.id}>
                    <AccordionItem value={`equipo-${equipo.id}`}>
                      <AccordionTrigger>{equipo.name}</AccordionTrigger>
                      <AccordionContent>
                        <p>Líder: {equipo.teamLeader?.name || 'No asignado'}</p>
                        <p>Miembros:</p>
                        <ul className="list-disc pl-5">
                          {equipo.members?.map((miembro) => (
                            <li key={miembro.id}>{miembro.name}</li>
                          )) || <li>No hay miembros asignados</li>}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))
              ) : (
                <p>No hay equipos existentes.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Crear Nuevo Equipo</h3>
          <div className="space-y-2">
            <label htmlFor="team-leader" className="block text-sm font-medium text-gray-700">
              Líder del Equipo
            </label>
            <Select onValueChange={manejarCambioLider} value={liderSeleccionado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un líder" />
              </SelectTrigger>
              <SelectContent>
                {lideresEquipo.map((lider) => (
                  <SelectItem key={lider.id} value={String(lider.id)}>
                    {lider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lideresEquipo.length === 0 && (
              <p className="text-yellow-600">No hay líderes de equipo disponibles.</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="team-members" className="block text-sm font-medium text-gray-700">
              Miembros del Equipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agentes.map((agente) => (
                <Button
                  key={agente.id}
                  variant={miembrosSeleccionados.includes(String(agente.id)) ? "default" : "outline"}
                  onClick={() => manejarCambioMiembro(String(agente.id))}
                  className="justify-start"
                >
                  {agente.name}
                </Button>
              ))}
            </div>
            {agentes.length === 0 && (
              <p className="text-yellow-600">No hay agentes disponibles.</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={manejarGuardarEquipo} 
          className="w-full"
          disabled={!liderSeleccionado || miembrosSeleccionados.length === 0}
        >
          Guardar Equipo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComponenteGestionEquipos;