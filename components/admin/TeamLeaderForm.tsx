'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Dirección de correo electrónico inválida"),
});

// Definimos el tipo para los valores del formulario basado en el schema
type FormValues = z.infer<typeof formSchema>;

const TeamLeaderForm = () => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/team-leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, role: 'team_leader' }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Sesión expirada. Por favor, inicie sesión nuevamente.",
          });
          return;
        }
        throw new Error(data.error || 'Error al crear el líder de equipo');
      }

      toast({
        title: "Líder agregado",
        description: "El líder de equipo ha sido agregado exitosamente.",
      });
      
      form.reset();
      router.refresh();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado. Por favor, inténtelo de nuevo.';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-0 mt-10">
      <CardHeader>
        <CardTitle>Agregar Nuevo Líder</CardTitle>
        <CardDescription>
          Ingrese los datos del nuevo líder de equipo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {form.formState.isSubmitting ? 'Agregando...' : 'Añadir Líder'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeamLeaderForm;