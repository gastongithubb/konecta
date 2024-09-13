// types/user.ts

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
export type UserRole = 'manager' | 'team_leader' | 'leader' | 'agent' | 'user';

export interface UserData {
  name: string;
  role: UserRole;
  // Add other relevant user data fields
}