export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isPasswordChanged: boolean;
  teamId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// types/user.ts
export type UserRole = 'user' | 'team_leader' | 'manager';

export interface UserData {
  name: string;
  role: UserRole;
}

export interface TeamLeader {
  id: number;  // Cambiado de number a string para coincidir con el tipo de Prisma
  name: string;
  email: string;
}