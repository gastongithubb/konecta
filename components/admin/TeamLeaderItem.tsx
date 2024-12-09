'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TeamLeader {
  id: number;
  name: string;
  email: string;
}

interface TeamLeaderItemProps {
  teamLeader: TeamLeader;
}

const TeamLeaderItem: React.FC<TeamLeaderItemProps> = ({ teamLeader }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEdit = () => {
    router.push(`/admin/team-leaders/${teamLeader.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/team-leaders/${teamLeader.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el líder de equipo');
      }

      toast({
        title: "Líder eliminado",
        description: "El líder de equipo ha sido eliminado exitosamente.",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Error inesperado al eliminar el líder de equipo',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="dark:text-white">{teamLeader.name}</TableCell>
      <TableCell className="dark:text-white">{teamLeader.email}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-red-600 text-red-600 hover:text-red-700 
                          hover:border-red-700 dark:border-red-500 dark:text-red-500 
                          dark:hover:text-red-400 dark:hover:border-red-400
                          disabled:opacity-50 dark:disabled:opacity-50"
                disabled={isDeleting}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="dark:text-gray-100">¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription className="dark:text-gray-400">
                  Esta acción no se puede deshacer. Se eliminará permanentemente el líder de equipo{' '}
                  <span className="font-medium dark:text-gray-300">{teamLeader.name}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600
                           dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500
                           text-white dark:text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TeamLeaderItem;