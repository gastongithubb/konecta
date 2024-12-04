'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Search, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PracticeNU {
  id: number
  codigo: string
  nucodigo: string
  descripcion: string
  comoPedirse?: string
  observaciones?: string
  isActive: boolean
}

const formSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nucodigo: z.string().min(1, 'El código NU/NB es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  comoPedirse: z.string().optional(),
  observaciones: z.string().optional(),
})

export default function NomencladorNUManager() {
  const [practices, setPractices] = useState<PracticeNU[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingPractice, setEditingPractice] = useState<PracticeNU | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPractice, setSelectedPractice] = useState<PracticeNU | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      nucodigo: '',
      descripcion: '',
      comoPedirse: '',
      observaciones: '',
    },
  })

  useEffect(() => {
    fetchPractices()
  }, [])

  useEffect(() => {
    if (editingPractice) {
      form.reset({
        codigo: editingPractice.codigo,
        nucodigo: editingPractice.nucodigo,
        descripcion: editingPractice.descripcion,
        comoPedirse: editingPractice.comoPedirse || '',
        observaciones: editingPractice.observaciones || '',
      })
    }
  }, [editingPractice, form])

  const fetchPractices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/nomenclador-nu')
      const data = await response.json()
      setPractices(data)
    } catch (error) {
      toast.error('Error al cargar las prácticas')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPractices = practices.filter(practice =>
    practice.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.nucodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.comoPedirse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (practice: PracticeNU) => {
    setEditingPractice(practice)
  }

  const handleDelete = async (practice: PracticeNU) => {
    setSelectedPractice(practice)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedPractice) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/nomenclador-nu/${selectedPractice.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar la práctica')

      toast.success('Práctica eliminada exitosamente')
      fetchPractices()
    } catch (error) {
      toast.error('Error al eliminar la práctica')
    } finally {
      setShowDeleteDialog(false)
      setSelectedPractice(null)
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const method = editingPractice ? 'PUT' : 'POST'
      const url = editingPractice 
        ? `/api/nomenclador-nu/${editingPractice.id}`
        : '/api/nomenclador-nu'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Error al ${editingPractice ? 'actualizar' : 'crear'} la práctica`)
      }

      toast.success(`Práctica ${editingPractice ? 'actualizada' : 'agregada'} exitosamente`)
      form.reset()
      setEditingPractice(null)
      fetchPractices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la práctica')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background dark:bg-background">
      <Card className="w-full border dark:border-gray-800">
        <CardHeader className="dark:bg-gray-800/50">
          <CardTitle className="dark:text-gray-100">Gestión de Nomenclador NU/NB</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {editingPractice 
              ? 'Editando práctica existente'
              : 'Agregue o busque prácticas del nomenclador NU/NB'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 dark:bg-gray-800/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el código" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nucodigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código NU/NB</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el código NU/NB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese la descripción" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comoPedirse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Cómo puede pedirse?</FormLabel>
                      <FormControl>
                        <Input placeholder="Formas alternativas de pedido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Input placeholder="Observaciones adicionales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} 
                  className="dark:hover:bg-primary/90">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPractice ? 'Actualizar Práctica' : 'Agregar Práctica'}
                </Button>
                {editingPractice && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPractice(null)
                      form.reset()
                    }}
                    className="dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cancelar Edición
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prácticas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:bg-gray-800/50 dark:border-gray-700"
            />
          </div>

          <div className="border rounded-lg overflow-hidden dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="dark:hover:bg-gray-800/50">
                  <TableHead className="dark:text-gray-300">Código</TableHead>
                  <TableHead className="dark:text-gray-300">Código NU/NB</TableHead>
                  <TableHead className="dark:text-gray-300">Descripción</TableHead>
                  <TableHead className="dark:text-gray-300">¿Cómo puede pedirse?</TableHead>
                  <TableHead className="dark:text-gray-300">Observaciones</TableHead>
                  <TableHead className="w-[50px] dark:text-gray-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 dark:text-gray-300">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPractices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 dark:text-gray-300">
                      No se encontraron prácticas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPractices.map((practice) => (
                    <TableRow key={practice.id} className="dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium dark:text-gray-300">{practice.codigo}</TableCell>
                      <TableCell className="dark:text-gray-300">{practice.nucodigo}</TableCell>
                      <TableCell className="dark:text-gray-300">{practice.descripcion}</TableCell>
                      <TableCell className="dark:text-gray-300">{practice.comoPedirse || '-'}</TableCell>
                      <TableCell className="dark:text-gray-300">{practice.observaciones || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                            <DropdownMenuItem 
                              onClick={() => handleEdit(practice)}
                              className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                              onClick={() => handleDelete(practice)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Confirmar eliminación</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              ¿Está seguro que desea eliminar esta práctica? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
              className="dark:hover:bg-red-900"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}