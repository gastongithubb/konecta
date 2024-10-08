export interface Case {
  id: number;
  claimDate: Date;
  startDate: Date;
  withinSLA: boolean;
  caseNumber: string;
  authorizationType: string;
  details: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  teamId: number;
}