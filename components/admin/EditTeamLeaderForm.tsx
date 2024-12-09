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

type FormValues = z.infer<typeof formSchema>;

interface TeamLeader {
  id: number;
  name: string;
  email: string;
}

interface EditTeamLeaderFormProps {
  teamLeader: TeamLeader;
}

const EditTeamLeaderForm: React.FC<EditTeamLeaderFormProps> = ({ teamLeader }) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teamLeader.name,
      email: teamLeader.email,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(`/api/team-leaders/${teamLeader.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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
        throw new Error(data.error || 'Error al actualizar el líder de equipo');
      }

      toast({
        title: "Líder actualizado",
        description: "Los datos del líder han sido actualizados exitosamente.",
      });
      
      router.push('/admin/team-leaders');
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Error inesperado al actualizar el líder de equipo',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Editar Líder de Equipo</CardTitle>
        <CardDescription>
          Modifique los datos del líder de equipo
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
                    <Input 
                      placeholder="Juan Pérez" 
                      {...field}
                      className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
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
                    <Input 
                      type="email" 
                      placeholder="juan@ejemplo.com" 
                      {...field}
                      className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
                className="dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {form.formState.isSubmitting && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditTeamLeaderForm;