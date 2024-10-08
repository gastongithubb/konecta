'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from '@/hooks/useSocket';
import CaseList from './CaseList';
import { Case } from '@/types/case';

const formSchema = z.object({
  claimDate: z.date(),
  startDate: z.date(),
  withinSLA: z.boolean(),
  caseNumber: z.string().min(1, "El número de caso es requerido"),
  authorizationType: z.enum(["Medicamentos", "Cirugías", "Ambulatorio", "Leches medicamentosas", "Otros"]),
  details: z.string().min(10, "Por favor, proporcione más detalles"),
});

type FormValues = z.infer<typeof formSchema>;

const CaseUploadComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const socket = useSocket(session?.user?.id ? session.user.id.toString() : '');
  const [cases, setCases] = useState<Case[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claimDate: new Date(),
      startDate: new Date(),
      withinSLA: true,
      caseNumber: '',
      authorizationType: 'Medicamentos',
      details: '',
    },
  });

  const fetchCases = useCallback(async () => {
    try {
      const response = await fetch('/api/cases');
      if (!response.ok) {
        throw new Error('Error al obtener los casos');
      }
      const data = await response.json();
      setCases(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los casos. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/cases/counts');
      if (!response.ok) {
        throw new Error('Error al obtener los conteos');
      }
      const data = await response.json();
      setDailyCount(data.daily);
      setMonthlyCount(data.monthly);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los conteos. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCases();
    fetchCounts();
  }, [fetchCases, fetchCounts]);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el caso');
      }

      const result = await response.json();

      toast({
        title: "Caso creado",
        description: "El caso ha sido creado exitosamente.",
      });

      if (socket && session?.user?.teamId) {
        socket.emit('new-case', {
          teamId: session.user.teamId,
          caseNumber: result.data.caseNumber,
        });
      }

      form.reset();
      fetchCases();
      fetchCounts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al crear el caso. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el caso');
      }

      toast({
        title: "Caso eliminado",
        description: "El caso ha sido eliminado exitosamente.",
      });

      fetchCases();
      fetchCounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el caso. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: number) => {
    // Implement edit functionality
    console.log('Edit case', id);
  };

  const handleToggleStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el caso');
      }

      toast({
        title: "Caso actualizado",
        description: `El estado del caso ha sido actualizado a ${status}.`,
      });

      fetchCases();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el caso. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const filteredCases = cases.filter(caseItem => 
    caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access this page</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Estadísticas</h2>
        <p>Gestiones diarias: {dailyCount}</p>
        <p>Gestiones mensuales: {monthlyCount}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Cargar nuevo caso</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="claimDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Fecha de reclamo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline">
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Fecha de inicio de gestión</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline">
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="withinSLA"
              render={({ field }) => (
                <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Dentro del SLA</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Número de caso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el número de caso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorizationType"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Tipo de autorización</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de autorización" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                      <SelectItem value="Cirugías">Cirugías</SelectItem>
                      <SelectItem value="Ambulatorio">Ambulatorio</SelectItem>
                      <SelectItem value="Leches medicamentosas">Leches medicamentosas</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Detalles del caso</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Proporcione detalles sobre el caso"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="col-span-2">Enviar caso</Button>
          </form>
        </Form>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar por número de caso o detalles"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <CaseList
        cases={filteredCases}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default CaseUploadComponent;