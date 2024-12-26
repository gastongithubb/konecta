// types.ts
import { z } from 'zod';

export interface Case {
  id: number;
  caseNumber: string;
  claimDate: Date;
  startDate: Date;
  withinSLA: boolean;
  authorizationType: string;
  customType?: string;
  details: string;
  status: string;
  reiteratedFrom?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const formSchema = z.object({
  claimDate: z.date(),
  startDate: z.date(),
  withinSLA: z.boolean(),
  caseNumber: z.string().min(1, "El número de caso es requerido"),
  authorizationType: z.string().min(1, "El tipo de autorización es requerido"),
  customType: z.string().optional(),
  details: z.string().min(10, "Por favor, proporcione más detalles"),
  status: z.string().default('pending')
});

export type FormValues = z.infer<typeof formSchema>;

export interface CaseListProps {
  cases: Case[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, status: string) => Promise<void>;
}