'use client'

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Clock, Ticket, Server, FileText, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const systems = ['Orion', 'Xlite', 'Salesforce', 'Fluir'] as const;

const incidentSchema = z.object({
    system: z.enum(systems, {
        required_error: "Por favor seleccione un sistema",
    }),
    startTime: z.string({
        required_error: "Por favor seleccione la fecha y hora",
    }),
    ticketNumber: z.string().min(1, "El número de ticket es requerido"),
    description: z.string().optional(),
});

type IncidentForm = z.infer<typeof incidentSchema>;

interface Incident {
    id: number;
    system: typeof systems[number];
    startTime: string;
    ticketNumber: string;
    description?: string;
    status: string;
    createdAt: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function IncidentTracker() {
    const [loading, setLoading] = useState(false);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [canManageIncidents, setCanManageIncidents] = useState(false);
    const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

    const form = useForm<IncidentForm>({
        resolver: zodResolver(incidentSchema),
        defaultValues: {
            system: undefined,
            startTime: '',
            ticketNumber: '',
            description: '',
        },
    });

    useEffect(() => {
        checkUserRole();
        loadIncidents();
    }, []);

    const checkUserRole = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                next: { revalidate: 0 }
            });

            if (!response.ok) throw new Error('Error al verificar el usuario');

            const userData = await response.json();
            setUser(userData);
            setCanManageIncidents(['team_leader', 'manager'].includes(userData.role));
        } catch (error) {
            console.error('Error al verificar rol:', error);
            toast({
                title: 'Error',
                description: 'No se pudo verificar los permisos del usuario',
                variant: 'destructive',
            });
        }
    };

    const loadIncidents = async () => {
        try {
            const response = await fetch('/api/incidents', {
                next: { revalidate: 0 }
            });

            if (!response.ok) throw new Error('Error al cargar tickets');

            const data = await response.json();
            setIncidents(data);
        } catch (error) {
            console.error('Error al cargar tickets:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las tickets',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (incident: Incident) => {
        setEditingIncident(incident);
        form.reset({
            system: incident.system,
            startTime: new Date(incident.startTime).toISOString().slice(0, 16),
            ticketNumber: incident.ticketNumber,
            description: incident.description || ''
        });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este ticket?')) {
            return;
        }

        try {
            const response = await fetch(`/api/incidents?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el ticket');
            }

            toast({
                title: 'Éxito',
                description: 'ticket eliminado correctamente',
            });

            loadIncidents();
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'Error al eliminar el ticket',
                variant: 'destructive',
            });
        }
    };

    const onSubmit = async (data: IncidentForm) => {
        setLoading(true);
        try {
            const url = '/api/incidents';
            const method = editingIncident ? 'PUT' : 'POST';
            const body = editingIncident
                ? { ...data, id: editingIncident.id }
                : data;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    startTime: new Date(data.startTime).toISOString(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 400 && result.error === 'El número de ticket ya existe') {
                    toast({
                        title: 'Ticket Duplicado',
                        description: 'El número de ticket ingresado ya existe en el sistema',
                        variant: 'destructive',
                        duration: 5000,
                    });
                    form.setFocus('ticketNumber');
                    return;
                }
                throw new Error(result.error || 'Error al procesar el ticket');
            }

            toast({
                title: '¡Éxito!',
                description: editingIncident
                    ? 'Ticket actualizado correctamente'
                    : 'Ticket registrado correctamente',
            });

            form.reset();
            setEditingIncident(null);
            loadIncidents();
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error al procesar el ticket',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getSystemColor = (system: string) => {
        const colors = {
            Orion: 'text-blue-500 dark:text-blue-400',
            Xlite: 'text-green-500 dark:text-green-400',
            Salesforce: 'text-purple-500 dark:text-purple-400',
            Fluir: 'text-orange-500 dark:text-orange-400',
        };
        return colors[system as keyof typeof colors] || 'text-gray-500 dark:text-gray-400';
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {!user && (
                <Alert
                    variant="destructive"
                    className="animate-in fade-in slide-in-from-top duration-300"
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Debe iniciar sesión para acceder a esta funcionalidad
                    </AlertDescription>
                </Alert>
            )}

            {user && !canManageIncidents && (
                <Alert
                    variant="destructive"
                    className="animate-in fade-in slide-in-from-top duration-300"
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No tiene permisos para registrar tickets. Esta función está reservada para Lideres y Gerencia.
                    </AlertDescription>
                </Alert>
            )}

            {canManageIncidents && (
                <Card className="dark:bg-gray-800 animate-in fade-in-50 slide-in-from-top-4 duration-500">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white">
                            {editingIncident ? 'Editar Ticket' : 'Registrar Nuevo Ticket'}
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {editingIncident
                                ? 'Modifique los detalles del ticket'
                                : 'Ingrese los detalles del nueva ticket a registrar'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="system"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium dark:text-gray-300">Sistema</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="dark:bg-gray-700 dark:text-white transition-colors duration-200 hover:border-primary">
                                                            <SelectValue placeholder="Seleccionar sistema" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="dark:bg-gray-700">
                                                        {systems.map((system) => (
                                                            <SelectItem
                                                                key={system}
                                                                value={system}
                                                                className="dark:text-white dark:focus:bg-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Server className={`h-4 w-4 ${getSystemColor(system)}`} />
                                                                    {system}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium dark:text-gray-300">Fecha y Hora</FormLabel>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <FormControl>
                                                        <Input
                                                            type="datetime-local"
                                                            className="pl-10 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="ticketNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium dark:text-gray-300">Número de Ticket</FormLabel>
                                            <div className="relative">
                                                <Ticket className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingrese el número de ticket"
                                                        className="pl-10 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium dark:text-gray-300">Descripción</FormLabel>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <FormControl>
                                                    <Input
                                                        placeholder="Descripción opcional del incidente"
                                                        className="pl-10 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-primary focus:ring-2 focus:ring-primary"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Guardando...
                                            </span>
                                        ) : (
                                            editingIncident ? 'Actualizar Ticket' : 'Registrar Ticket'
                                        )}
                                    </Button>

                                    {editingIncident && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingIncident(null);
                                                form.reset();
                                            }}
                                            className="w-full md:w-auto transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Cancelar Edición
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            <Card className="dark:bg-gray-800 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold dark:text-white">Tickets Recientes</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Lista de tickets registradas ordenadas por fecha
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {incidents.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
                                No hay tickets registradas
                            </p>
                        ) : (
                            incidents.map((incident, index) => (
                                <div
                                    key={incident.id}
                                    className="group p-4 border dark:border-gray-700 rounded-lg space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Server className={`h-5 w-5 ${getSystemColor(incident.system)} transition-colors duration-200`} />
                                            <span className="font-medium dark:text-white">{incident.system}</span>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(incident.startTime).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm dark:text-gray-300">Ticket: {incident.ticketNumber}</span>
                                    </div>
                                    {incident.description && (
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{incident.description}</p>
                                        </div>
                                    )}
                                    {canManageIncidents && (
                                        <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 transition-transform duration-200 hover:scale-105 active:scale-95"
                                                onClick={() => handleEdit(incident)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex items-center gap-1 transition-transform duration-200 hover:scale-105 active:scale-95"
                                                onClick={() => handleDelete(incident.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Eliminar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}