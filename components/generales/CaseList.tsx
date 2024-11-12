import React from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Case } from '@/types/case';
import { User } from '@/types/user';

interface CaseListProps {
  cases: Case[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, onDelete, onEdit, onToggleStatus }) => {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const isManagerOrTeamLeader = user?.role === 'manager' || user?.role === 'team_leader';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Casos Cargados</h2>
      {cases.map((caseItem) => (
        <div key={caseItem.id} className="border p-4 mb-4 rounded-lg">
          <h3 className="text-lg font-semibold">{caseItem.caseNumber}</h3>
          <p><strong>Tipo:</strong> {caseItem.authorizationType}</p>
          <p><strong>Detalles:</strong> {caseItem.details}</p>
          <p><strong>Fecha de reclamo:</strong> {new Date(caseItem.claimDate).toLocaleDateString()}</p>
          <p><strong>Fecha de inicio:</strong> {new Date(caseItem.startDate).toLocaleDateString()}</p>
          <p><strong>Dentro del SLA:</strong> {caseItem.withinSLA ? 'Sí' : 'No'}</p>
          <p><strong>Estado:</strong> {caseItem.status}</p>
          {isManagerOrTeamLeader && (
            <div className="mt-2 flex items-center space-x-2">
              <Select
                onValueChange={(value) => onToggleStatus(caseItem.id, value)}
                defaultValue={caseItem.status}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => onEdit(caseItem.id)} variant="outline" size="sm">
                Editar
              </Button>
              <Button onClick={() => onDelete(caseItem.id)} variant="destructive" size="sm">
                Eliminar
              </Button>
            </div>
          )}
        </div>
      ))}
      {cases.length === 0 && (
        <p className="text-gray-500 italic">No hay casos cargados.</p>
      )}
    </div>
  );
};

export default CaseList;