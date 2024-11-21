'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrackingData {
  caseNumber: string;
  action: 'Derivar' | 'Cerrar';
  area: string;
  reason: string;
}

const TrackingForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData>({
    caseNumber: '',
    action: 'Derivar',
    area: '',
    reason: '',
  });

  const handleChange = (
    name: string,
    value: string
  ) => {
    setTrackingData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'action' && value === 'Cerrar' ? { area: '' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/case-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData),
      });

      if (!response.ok) throw new Error('Error saving tracking');

      // Resetear el formulario
      setTrackingData({
        caseNumber: '',
        action: 'Derivar',
        area: '',
        reason: '',
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el seguimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Nuevo Seguimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Número de Caso
            </label>
            <Input
              value={trackingData.caseNumber}
              onChange={(e) => handleChange('caseNumber', e.target.value)}
              required
              placeholder="Ej: CAS-12345"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Acción
            </label>
            <Select
              value={trackingData.action}
              onValueChange={(value) => handleChange('action', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Derivar">Derivar</SelectItem>
                <SelectItem value="Cerrar">Cerrar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {trackingData.action === 'Derivar' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Área
              </label>
              <Select
                value={trackingData.area}
                onValueChange={(value) => handleChange('area', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione área" />
                </SelectTrigger>
                <SelectContent>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Motivo
            </label>
            <Textarea
              value={trackingData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              required
              placeholder="Describe brevemente el motivo..."
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Seguimiento'}
          </Button>
        </form>

        {showSuccess && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Seguimiento guardado exitosamente
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingForm;