// components/CaseList.tsx
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUS_STYLES } from './Constants';
import type { CaseListProps } from './types';

type StatusStyles = {
  [key: string]: string;
};

const CaseList = React.memo<CaseListProps>(({ cases, onDelete, onEdit, onToggleStatus }) => {
  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Card key={caseItem.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{caseItem.caseNumber}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-sm ${(STATUS_STYLES as StatusStyles)[caseItem.status]}`}>
                    {caseItem.status === 'pending' && 'Pendiente'}
                    {caseItem.status === 'in-progress' && 'En Proceso'}
                    {caseItem.status === 'completed' && 'Completado'}
                    {caseItem.status === 'cancelled' && 'Cancelado'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Fecha de reclamo: {format(new Date(caseItem.claimDate), 'PPP', { locale: es })}
                </div>
                {caseItem.reiteratedFrom && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500">
                    Caso reiterado
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  defaultValue={caseItem.status}
                  onValueChange={(value) => onToggleStatus(caseItem.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Proceso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(caseItem.id)}
                >
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
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Tipo: </span>
                  {caseItem.authorizationType}
                  {caseItem.customType && ` - ${caseItem.customType}`}
                </div>
                <div>
                  <span className="font-medium">SLA: </span>
                  {caseItem.withinSLA ? 
                    <span className="text-green-600 dark:text-green-500">Dentro del tiempo</span> : 
                    <span className="text-red-600 dark:text-red-500">Fuera del tiempo</span>
                  }
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <span className="font-medium">Detalles: </span>
                {caseItem.details}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {cases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-3xl font-semibold text-muted-foreground">
            No se encontraron casos
          </div>
          <p className="text-muted-foreground mt-2">
            Los casos que registres aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
});

CaseList.displayName = 'CaseList';

export default CaseList;