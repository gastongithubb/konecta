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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

// Definición del tipo para las prácticas NU/NB
interface PracticeNU {
  id: number
  codigo: string
  nucodigo: string
  descripcion: string
  comoPedirse?: string
  observaciones?: string
  isActive: boolean
}

// Schema de validación
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

  // Cargar prácticas existentes
  useEffect(() => {
    fetchPractices()
  }, [])

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

  // Filtrar prácticas según término de búsqueda
  const filteredPractices = practices.filter(practice =>
    practice.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.nucodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.comoPedirse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/nomenclador-nu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear la práctica')
      }

      toast.success('Práctica agregada exitosamente')
      form.reset()
      fetchPractices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la práctica')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Nomenclador NU/NB</CardTitle>
          <CardDescription>
            Agregue o busque prácticas del nomenclador NU/NB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario de nueva práctica */}
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
              <Button type="submit" disabled={isLoading}>
                Agregar Práctica
              </Button>
            </form>
          </Form>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prácticas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Tabla de prácticas */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Código NU/NB</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>¿Cómo puede pedirse?</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPractices.map((practice) => (
                  <TableRow key={practice.id}>
                    <TableCell className="font-medium">{practice.codigo}</TableCell>
                    <TableCell>{practice.nucodigo}</TableCell>
                    <TableCell>{practice.descripcion}</TableCell>
                    <TableCell>{practice.comoPedirse || '-'}</TableCell>
                    <TableCell>{practice.observaciones || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}