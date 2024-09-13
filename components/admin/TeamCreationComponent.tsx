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
import { Alert, AlertDescription } from "@/components/ui/alert";

type Usuario = {
  id: number;
  name: string;
  role: string;
};

type RespuestaAPI = Usuario[] | Record<string, Usuario>;

const ComponenteCreacionEquipo: React.FC = () => {
  const [lideresEquipo, setLideresEquipo] = useState<Usuario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [liderSeleccionado, setLiderSeleccionado] = useState<string>('');
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const respuestaLideres = await fetch('/api/team-leaders');
        const respuestaUsuarios = await fetch('/api/agents');
        
        if (!respuestaLideres.ok || !respuestaUsuarios.ok) {
          throw new Error('Error al obtener usuarios');
        }

        const datosLideres: RespuestaAPI = await respuestaLideres.json();
        const datosUsuarios: RespuestaAPI = await respuestaUsuarios.json();

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
        const usuariosProcesados = procesarUsuarios(datosUsuarios).filter(u => u.role === 'user');

        setLideresEquipo(lideresProcesados);
        setUsuarios(usuariosProcesados);

        if (lideresProcesados.length === 0) {
          setError('No se encontraron líderes de equipo. Por favor, contacte al administrador.');
        }
        if (usuariosProcesados.length === 0) {
          setError(prev => prev ? `${prev} No se encontraron usuarios.` : 'No se encontraron usuarios. Por favor, contacte al administrador.');
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
        
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.error || 'Error al guardar el equipo');
        }
        
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Crear Nuevo Equipo</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {exito && <Alert variant="default" className="bg-green-100 text-green-800 border-green-300"><AlertDescription>{exito}</AlertDescription></Alert>}
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
        {usuarios.length > 0 ? (
          <div className="space-y-2">
            <label htmlFor="team-members" className="text-sm font-medium text-gray-700">
              Miembros del Equipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {usuarios.map((usuario) => (
                <Button
                  key={usuario.id}
                  variant={miembrosSeleccionados.includes(String(usuario.id)) ? "default" : "outline"}
                  onClick={() => manejarCambioMiembro(String(usuario.id))}
                  className="justify-start"
                >
                  {usuario.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-yellow-500">No hay usuarios disponibles.</div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={manejarGuardarEquipo} className="w-full" disabled={!liderSeleccionado || miembrosSeleccionados.length === 0}>
          Guardar Equipo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComponenteCreacionEquipo;