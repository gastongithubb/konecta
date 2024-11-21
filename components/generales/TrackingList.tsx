// src/components/TrackingList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CaseTracking {
  id: number;
  caseNumber: string;
  action: string;
  area: string | null;
  reason: string;
  completed: boolean;
  createdAt: string;
}

const TrackingList: React.FC = () => {
  const [trackings, setTrackings] = useState<CaseTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackings();
  }, []);

  const fetchTrackings = async () => {
    try {
      const response = await fetch('/api/case-tracking');
      if (!response.ok) throw new Error('Error fetching trackings');
      const data = await response.json();
      setTrackings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number, completed: boolean) => {
    try {
      const response = await fetch('/api/case-tracking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });

      if (!response.ok) throw new Error('Error updating tracking');
      
      setTrackings(prevTrackings => 
        prevTrackings.map(tracking => 
          tracking.id === id ? { ...tracking, completed } : tracking
        )
      );
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado del seguimiento');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Lista de Seguimientos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Cargando seguimientos...</div>
          </div>
        ) : trackings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay seguimientos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Estado</TableHead>
                  <TableHead>N° Caso</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-32">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackings.map((tracking) => (
                  <TableRow 
                    key={tracking.id}
                    className={tracking.completed ? 'bg-gray-50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={tracking.completed}
                        onCheckedChange={(checked) => 
                          handleComplete(tracking.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tracking.caseNumber}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={tracking.action === 'Derivar' ? 'default' : 'secondary'}
                        className="font-normal"
                      >
                        {tracking.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{tracking.area || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tracking.reason}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(tracking.createdAt), "dd/MM/yy HH:mm", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingList;