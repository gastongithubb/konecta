// components/CaseForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { AUTHORIZATION_TYPES } from './Constants';
import { formSchema, type FormValues } from './types';

interface CaseFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<FormValues>;
  onCustomTypeChange: (value: string) => void;
  onCaseNumberChange: (value: string) => void;
  showCustomType: boolean;
}

const CaseForm: React.FC<CaseFormProps> = ({
  onSubmit,
  isLoading,
  initialData,
  onCustomTypeChange,
  onCaseNumberChange,
  showCustomType,
}) => {
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
      status: 'pending',
      ...initialData
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha de reclamo */}
          <FormField
            control={form.control}
            name="claimDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de reclamo</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
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

          {/* Fecha de inicio */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
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

          {/* Número de caso */}
          <FormField
            control={form.control}
            name="caseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de caso</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onCaseNumberChange(e.target.value);
                    }}
                    placeholder="Ingrese el número de caso"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de autorización */}
          <FormField
            control={form.control}
            name="authorizationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de autorización</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onCustomTypeChange(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AUTHORIZATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo personalizado */}
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

        {/* SLA Switch */}
        <FormField
          control={form.control}
          name="withinSLA"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Dentro del SLA</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Indique si el caso está dentro del tiempo establecido
                </p>
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

        {/* Detalles */}
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
                  className="resize-none min-h-[120px]"
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
  );
};

export default CaseForm;