'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Loader2 } from 'lucide-react';
import { useSession } from '@/app/SessionProvider';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

// Components
import CaseList from '@/components/generales/formF4/CaseList';
import CaseForm from '@/components/generales/formF4/CaseForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Types
import type { Case, FormValues } from './formF4/types';

const CaseManagement = () => {
  const session = useSession();
  const { toast } = useToast();
  const socket = useSocket(session?.id?.toString() || '');
  
  // State
  const [cases, setCases] = useState<Case[]>([]);
  const [counts, setCounts] = useState({ daily: 0, monthly: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [duplicateCase, setDuplicateCase] = useState<Case | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!session?.id || !mounted) return;
    
    setIsLoading(true);
    try {
      const [casesResponse, countsResponse] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/cases/counts')
      ]);

      if (!casesResponse.ok || !countsResponse.ok) {
        throw new Error('Error al obtener los datos');
      }

      const [casesData, countsData] = await Promise.all([
        casesResponse.json(),
        countsResponse.json()
      ]);

      setCases(casesData.data);
      setCounts({
        daily: countsData.daily,
        monthly: countsData.monthly
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.id, toast, mounted]);

  // Effects
  useEffect(() => {
    setMounted(true);
    if (session?.id) {
      fetchData();
    }
    return () => setMounted(false);
  }, [session?.id, fetchData]);

  useEffect(() => {
    if (!socket || !session?.teamId || !mounted) return;

    const handleNewCase = (data: any) => {
      if (data.teamId === session.teamId) {
        fetchData();
      }
    };

    socket.on('new-case', handleNewCase);
    return () => {
      socket.off('new-case', handleNewCase);
    };
  }, [socket, session?.teamId, fetchData, mounted]);

  // Handlers
  const handleCaseNumberChange = async (value: string) => {
    if (!mounted || !value) return;

    try {
      const response = await fetch(`/api/cases/check-duplicate/${value}`);
      if (!response.ok) throw new Error('Error al verificar el caso');
      
      const data = await response.json();
      if (data.duplicate) {
        setDuplicateCase(data.duplicate);
        setShowDuplicateDialog(true);
      }
    } catch (error) {
      console.error('Error checking duplicate case:', error);
    }
  };

  const handleTypeChange = (value: string) => {
    setShowCustomType(value === 'Otros');
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cases/${id}`, { method: 'DELETE' });

      if (!response.ok) throw new Error('Error al eliminar el caso');

      toast({
        title: "Éxito",
        description: "Caso eliminado correctamente",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el caso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const caseToEdit = cases.find(c => c.id === id);
    if (caseToEdit) {
      setShowCustomType(caseToEdit.authorizationType === 'Otros');
      // The form will be updated through initialData prop
    }
  };

  const handleToggleStatus = async (id: number, status: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Error al actualizar el caso');

      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 409) {
        setDuplicateCase(result.existingCase);
        setShowDuplicateDialog(true);
        return;
      }

      if (!response.ok) throw new Error(result.error || 'Error al crear el caso');

      toast({
        title: "Caso creado",
        description: "El caso ha sido registrado exitosamente",
      });

      if (socket && session?.teamId) {
        socket.emit('new-case', {
          teamId: session.teamId,
          caseNumber: result.data.caseNumber,
        });
      }

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el caso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReiteratedCase = async () => {
    if (!duplicateCase) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...duplicateCase,
          reiteratedFrom: duplicateCase.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Error al crear el caso reiterado');

      toast({
        title: "Caso reiterado creado",
        description: "La reiteración se ha registrado correctamente",
      });

      setShowDuplicateDialog(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la reiteración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered cases
  const filteredCases = useMemo(() => 
    cases.filter(caseItem =>
      caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.authorizationType.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [cases, searchTerm]
  );

  if (isLoading && !mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Acceso Restringido</h2>
          <p className="text-muted-foreground">Por favor, inicie sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Casos del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.daily}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), 'PPPP', { locale: es })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Casos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.monthly}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), 'MMMM yyyy', { locale: es })}
              </p>
            </CardContent>
          </Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por número de caso, tipo o detalles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">Lista de Casos</TabsTrigger>
            <TabsTrigger value="new">Nuevo Caso</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <CaseList
              cases={filteredCases}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardContent className="pt-6">
                <CaseForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onCustomTypeChange={handleTypeChange}
                  onCaseNumberChange={handleCaseNumberChange}
                  showCustomType={showCustomType}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para casos duplicados */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Caso duplicado detectado
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este caso ya fue registrado anteriormente. ¿Desea crear una reiteración del caso?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDuplicateDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={createReiteratedCase}>
              Crear reiteración
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CaseManagement;