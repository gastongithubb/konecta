'use client';

import React from 'react';
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

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access this page</div>;
  }

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
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al crear el caso. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="claimDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
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
            <FormItem className="flex flex-col">
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
            <FormItem>
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
            <FormItem>
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
            <FormItem>
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

        <Button type="submit">Enviar caso</Button>
      </form>
    </Form>
  );
};

export default CaseUploadComponent;