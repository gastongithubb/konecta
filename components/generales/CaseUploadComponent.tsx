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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Loader2 } from 'lucide-react';

// Tipos
export interface Case {
  id: number;
  caseNumber: string;
  claimDate: Date;
  startDate: Date;
  withinSLA: boolean;
  authorizationType: string;
  customType?: string;
  details: string;
  status: string;
  reiteratedFrom?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CaseListProps {
  cases: Case[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, status: string) => Promise<void>;
}

const formSchema = z.object({
  claimDate: z.date(),
  startDate: z.date(),
  withinSLA: z.boolean(),
  caseNumber: z.string().min(1, "El número de caso es requerido"),
  authorizationType: z.string().min(1, "El tipo de autorización es requerido"),
  customType: z.string().optional(),
  details: z.string().min(10, "Por favor, proporcione más detalles"),
  status: z.string().default('pending')
});

type FormValues = z.infer<typeof formSchema>;

// Componente CaseList
const CaseList: React.FC<CaseListProps> = ({ cases, onDelete, onEdit, onToggleStatus }) => {
  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Card key={caseItem.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="font-medium">{caseItem.caseNumber}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(caseItem.claimDate), 'PPP', { locale: es })}
                </div>
                {caseItem.reiteratedFrom && (
                  <div className="text-sm text-yellow-600">
                    Caso reiterado
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Select
                  defaultValue={caseItem.status}
                  onValueChange={(value) => onToggleStatus(caseItem.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Proceso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => onEdit(caseItem.id)}>
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(caseItem.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm">
                <span className="font-medium">Tipo: </span>
                {caseItem.authorizationType}
                {caseItem.customType && ` - ${caseItem.customType}`}
              </div>
              <div className="text-sm mt-1">
                <span className="font-medium">Detalles: </span>
                {caseItem.details}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {cases.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron casos
        </div>
      )}
    </div>
  );
};

// Componente Principal
const CaseUploadComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const socket = useSocket(session?.user?.id ? session.user.id.toString() : '');
  const [cases, setCases] = useState<Case[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [duplicateCase, setDuplicateCase] = useState<Case | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claimDate: new Date(),
      startDate: new Date(),
      withinSLA: true,
      caseNumber: '',
      authorizationType: 'Medicamentos',
      customType: '',
      details: '',
      status: 'pending'
    },
  });

  const fetchCases = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        description: "No se pudieron cargar los conteos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (session) {
      fetchCases();
      fetchCounts();
    }
  }, [fetchCases, fetchCounts, session]);

  const checkDuplicateCase = useCallback(async (caseNumber: string) => {
    try {
      const response = await fetch(`/api/cases/check-duplicate/${caseNumber}`);
      if (!response.ok) {
        throw new Error('Error al verificar el caso');
      }
      const data = await response.json();
      return data.duplicate;
    } catch (error) {
      console.error('Error checking duplicate case:', error);
      return null;
    }
  }, []);

  const handleCaseNumberChange = async (value: string) => {
    form.setValue('caseNumber', value);
    if (value) {
      const duplicate = await checkDuplicateCase(value);
      if (duplicate) {
        setDuplicateCase(duplicate);
        setShowDuplicateDialog(true);
      }
    }
  };

  const handleTypeChange = (value: string) => {
    form.setValue('authorizationType', value);
    setShowCustomType(value === 'Otros');
    if (value !== 'Otros') {
      form.setValue('customType', '');
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      // Manejar específicamente el caso de duplicado
      if (response.status === 409) {
        setDuplicateCase(result.existingCase);
        setShowDuplicateDialog(true);
        setIsLoading(false);
        return; // Importante: retornar aquí para no continuar con el resto del código
      }
  
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el caso');
      }
  
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
        description: error instanceof Error ? error.message : "Error al crear el caso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para crear un caso reiterado
  const createReiteratedCase = async () => {
    if (!duplicateCase) return;
  
    try {
      setIsLoading(true);
      const values = form.getValues();
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          reiteratedFrom: duplicateCase.id,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el caso reiterado');
      }
  
      toast({
        title: "Caso reiterado creado",
        description: "El caso ha sido creado como reiteración exitosamente.",
      });
  
      setShowDuplicateDialog(false);
      form.reset();
      fetchCases();
      fetchCounts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el caso reiterado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
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
        description: "No se pudo eliminar el caso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const caseToEdit = cases.find(c => c.id === id);
    if (caseToEdit) {
      form.reset({
        claimDate: new Date(caseToEdit.claimDate),
        startDate: new Date(caseToEdit.startDate),
        withinSLA: caseToEdit.withinSLA,
        caseNumber: caseToEdit.caseNumber,
        authorizationType: caseToEdit.authorizationType,
        customType: caseToEdit.customType,
        details: caseToEdit.details,
        status: caseToEdit.status
      });
      setShowCustomType(caseToEdit.authorizationType === 'Otros');
    }
  };

  const handleToggleStatus = async (id: number, status: string) => {
    try {
      setIsLoading(true);
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
        description: "No se pudo actualizar el caso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem =>
    caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.authorizationType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Acceso Restringido</h2>
          <p className="text-gray-500">Por favor, inicie sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Stats Cards */}
        <div className="col-span-12 lg:col-span-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{dailyCount}</div>
                <div className="text-sm text-gray-500">Casos Hoy</div>
                </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{monthlyCount}</div>
                <div className="text-sm text-gray-500">Casos del Mes</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Bar */}
        <div className="col-span-12 lg:col-span-8">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por número de caso, tipo o detalles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista de Casos</TabsTrigger>
              <TabsTrigger value="new">Nuevo Caso</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardContent className="pt-6">
                  <CaseList
                    cases={filteredCases}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="claimDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha de reclamo</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span>Seleccione una fecha</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
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
                              <FormLabel>Fecha de inicio</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span>Seleccione una fecha</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
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
                          name="caseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de caso</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  onChange={(e) => handleCaseNumberChange(e.target.value)}
                                  placeholder="Ingrese el número de caso"
                                />
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
                              <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el tipo" />
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

                        {showCustomType && (
                          <FormField
                            control={form.control}
                            name="customType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Especificar tipo</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Describa el tipo de autorización"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="withinSLA"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Dentro del SLA</FormLabel>
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
                        name="details"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detalles del caso</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Proporcione detalles sobre el caso"
                                className="resize-none h-24"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando
                          </>
                        ) : (
                          'Crear Caso'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Caso duplicado detectado</AlertDialogTitle>
            <AlertDialogDescription>
              Este caso ya fue registrado anteriormente. ¿Desea crear una reiteración del caso?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={createReiteratedCase}>
              Crear reiteración
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CaseUploadComponent;