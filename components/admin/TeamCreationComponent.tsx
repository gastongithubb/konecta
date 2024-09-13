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

type Usuario = {
  id: number;
  name: string;
  role: string;
};

type RespuestaAPI = Usuario[] | Record<string, Usuario>;

const ComponenteCreacionEquipo: React.FC = () => {
  const [lideresEquipo, setLideresEquipo] = useState<Usuario[]>([]);
  const [agentes, setAgentes] = useState<Usuario[]>([]);
  const [liderSeleccionado, setLiderSeleccionado] = useState<string>('');
  const [agentesSeleccionados, setAgentesSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // @typescript-eslint/no-unused-vars
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const respuestaLideres = await fetch('/api/team-leaders');
        const respuestaAgentes = await fetch('/api/agents');
        
        if (!respuestaLideres.ok || !respuestaAgentes.ok) {
          throw new Error('Error al obtener usuarios');
        }

        const datosLideres: RespuestaAPI = await respuestaLideres.json();
        const datosAgentes: RespuestaAPI = await respuestaAgentes.json();

        console.log('Datos de líderes:', JSON.stringify(datosLideres, null, 2));
        console.log('Datos de agentes:', JSON.stringify(datosAgentes, null, 2));

        // setDebug(prev => prev + `Datos de líderes: ${JSON.stringify(datosLideres)}\n`);
        // setDebug(prev => prev + `Datos de agentes: ${JSON.stringify(datosAgentes)}\n`);

        const procesarUsuarios = (datos: RespuestaAPI): Usuario[] => {
          if (Array.isArray(datos)) {
            return datos;
          } else if (typeof datos === 'object' && datos !== null) {
            return Object.values(datos).filter((usuario): usuario is Usuario => 
              typeof usuario === 'object' && usuario !== null && 
              'id' in usuario && 'name' in usuario && 'role' in usuario
            );
          }
          return [];
        };

        const lideresProcesados = procesarUsuarios(datosLideres);
        const agentesProcesados = procesarUsuarios(datosAgentes);

        setLideresEquipo(lideresProcesados);
        setAgentes(agentesProcesados);

        if (lideresProcesados.length === 0) {
          setError('No se encontraron líderes de equipo. Por favor, contacte al administrador.');
        }
        if (agentesProcesados.length === 0) {
          setError(prev => prev ? `${prev} No se encontraron agentes.` : 'No se encontraron agentes. Por favor, contacte al administrador.');
        }

      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar usuarios. Por favor, intenta de nuevo más tarde.');
      }
    };
    cargarUsuarios();
  }, []);

  const manejarCambioLider = (valor: string) => {
    setLiderSeleccionado(valor);
  };
  
  const manejarCambioAgente = (valor: string) => {
    setAgentesSeleccionados(prev =>
      prev.includes(valor) ? prev.filter(id => id !== valor) : [...prev, valor]
    );
  };  

  const manejarGuardarEquipo = async () => {
    if (liderSeleccionado && agentesSeleccionados.length > 0) {
      try {
        const respuesta = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamLeaderId: liderSeleccionado,
            memberIds: agentesSeleccionados
          }),
        });
        
        if (!respuesta.ok) {
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
        {lideresEquipo.length > 0 ? (
          <div className="space-y-2">
            <label htmlFor="team-leader" className="text-sm font-medium text-gray-700">
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
          </div>
        ) : (
          <div className="text-yellow-500">No hay líderes de equipo disponibles.</div>
        )}
        {agentes.length > 0 ? (
          <div className="space-y-2">
            <label htmlFor="team-agents" className="text-sm font-medium text-gray-700">
              Agentes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agentes.map((agente) => (
                <Button
                  key={agente.id}
                  variant={agentesSeleccionados.includes(String(agente.id)) ? "default" : "outline"}
                  onClick={() => manejarCambioAgente(String(agente.id))}
                  className="justify-start"
                >
                  {agente.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-yellow-500">No hay agentes disponibles.</div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={manejarGuardarEquipo} className="w-full" disabled={!liderSeleccionado || agentesSeleccionados.length === 0}>
          Guardar Equipo
        </Button>
      </CardFooter>
      <pre>{debug}</pre>
    </Card>
  );
};

export default ComponenteCreacionEquipo;