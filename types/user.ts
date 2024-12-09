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
  // Add other relevant user data fields
}