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
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Practice {
  id: number
  codigo: string
  descripcion: string
  comoPedirse?: string
  isActive: boolean
}

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

  const filteredPractices = practices.filter(practice =>
    practice.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.comoPedirse?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    <div className="container mx-auto p-6 space-y-6 bg-background dark:bg-background transition-colors duration-200">
      <Card className="border dark:border-gray-800">
        <CardHeader className="dark:bg-gray-800/50">
          <CardTitle className="dark:text-gray-100">Gestión de Nomenclador NM</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Agregue o busque prácticas del nomenclador NM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 dark:bg-gray-800/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Código</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ingrese el código" 
                          className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="dark:text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Descripción</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ingrese la descripción" 
                          className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="dark:text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comoPedirse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">¿Cómo puede pedirse?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Formas alternativas de pedido" 
                          className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="dark:text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="dark:hover:bg-primary/90"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agregar Práctica
              </Button>
            </form>
          </Form>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder="Buscar prácticas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-400"
            />
          </div>

          <div className="border rounded-lg dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="dark:hover:bg-gray-800/50">
                  <TableHead className="dark:text-gray-300">Código</TableHead>
                  <TableHead className="dark:text-gray-300">Descripción</TableHead>
                  <TableHead className="dark:text-gray-300">¿Cómo puede pedirse?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 dark:text-gray-300">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPractices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 dark:text-gray-300">
                      No se encontraron prácticas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPractices.map((practice) => (
                    <TableRow key={practice.id} className="dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium dark:text-gray-300">
                        {practice.codigo}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {practice.descripcion}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {practice.comoPedirse || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}