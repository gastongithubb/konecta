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

// Definición del tipo para las prácticas
interface Practice {
  id: number
  codigo: string
  descripcion: string
  comoPedirse?: string
  isActive: boolean
}

// Schema de validación
const formSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  comoPedirse: z.string().optional(),
})

export default function NomencladorNMManager() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      descripcion: '',
      comoPedirse: '',
    },
  })

  // Cargar prácticas existentes
  useEffect(() => {
    fetchPractices()
  }, [])

  const fetchPractices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/nomenclador-nm')
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
    practice.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.comoPedirse?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/nomenclador-nm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Error al crear la práctica')

      toast.success('Práctica agregada exitosamente')
      form.reset()
      fetchPractices()
    } catch (error) {
      toast.error('Error al crear la práctica')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Nomenclador NM</CardTitle>
          <CardDescription>
            Agregue o busque prácticas del nomenclador NM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario de nueva práctica */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>¿Cómo puede pedirse?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPractices.map((practice) => (
                  <TableRow key={practice.id}>
                    <TableCell className="font-medium">{practice.codigo}</TableCell>
                    <TableCell>{practice.descripcion}</TableCell>
                    <TableCell>{practice.comoPedirse || '-'}</TableCell>
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