// types/case.ts
export interface Case {
  id: number;
  caseNumber: string;
  claimDate: Date;
  startDate: Date;
  withinSLA: boolean;
  authorizationType: string;
  details: string;
  status: string;
  userId: number;
  teamId: number | null;
  reiteratedFrom?: number | null;
  customType?: string | null;
}