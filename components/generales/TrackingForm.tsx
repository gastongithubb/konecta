'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from "next-themes";

interface TrackingData {
  caseNumber: string;
  action: 'Derivar' | 'Cerrar';
  area: string;
  reason: string;
  teamId?: number;
  userId?: number;
}

interface ApiResponse {
  message: string;
  data?: any;
  error?: string;
}

const TrackingForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [trackingData, setTrackingData] = useState<TrackingData>({
    caseNumber: '',
    action: 'Derivar',
    area: '',
    reason: '',
  });

  const handleChange = (name: string, value: string) => {
    setError(null);
    setTrackingData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'action' && value === 'Cerrar' ? { area: '' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/case-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el seguimiento');
      }

      setTrackingData({
        caseNumber: '',
        action: 'Derivar',
        area: '',
        reason: '',
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar el seguimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg dark:shadow-blue-500/5 transition-all">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 transition-colors">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Nuevo Seguimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 dark:bg-gray-900/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Número de Caso
              </label>
              <Input
                value={trackingData.caseNumber}
                onChange={(e) => handleChange('caseNumber', e.target.value)}
                required
                placeholder="Ej: CAS-12345"
                className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 
                  dark:placeholder-gray-400 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Acción
              </label>
              <Select
                value={trackingData.action}
                onValueChange={(value: 'Derivar' | 'Cerrar') => handleChange('action', value)}
              >
                <SelectTrigger className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="Seleccione acción" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="Derivar">Derivar</SelectItem>
                  <SelectItem value="Cerrar">Cerrar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {trackingData.action === 'Derivar' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Área
              </label>
              <Select
                value={trackingData.area}
                onValueChange={(value) => handleChange('area', value)}
                required
              >
                <SelectTrigger className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="Seleccione área" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="Autorizaciones">Autorizaciones</SelectItem>
                  <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                  <SelectItem value="Afiliaciones">Afiliaciones</SelectItem>
                  <SelectItem value="Pagos">Pagos</SelectItem>
                  <SelectItem value="Cobranzas">Cobranzas</SelectItem>
                  <SelectItem value="Liquidaciones">Liquidaciones</SelectItem>
                  <SelectItem value="Auditoria de copagos">Auditoria de copagos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo
            </label>
            <Textarea
              value={trackingData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              required
              placeholder="Describe brevemente el motivo..."
              className="h-20 resize-none dark:bg-gray-800 dark:border-gray-700 
                dark:text-gray-100 dark:placeholder-gray-400 transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 
              dark:hover:bg-blue-800 h-9 transition-colors"
          >
            {isSubmitting ? 'Guardando...' : 'Enviar Caso'}
          </Button>
        </form>

        {error && (
          <Alert className="mt-4 bg-red-50 dark:bg-red-900/20 
            border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 
              border-green-200 dark:border-green-800 transition-colors">
              <AlertDescription className="text-green-800 dark:text-green-300">
                Caso enviado exitosamente
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingForm;