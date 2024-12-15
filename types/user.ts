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
  avatarUrl?: string | null;
}

export interface UserResponse {
  user: User;
}

export type UserRole = 'user' | 'team_leader' | 'manager';

export interface UserData {
  name: string;
  role: UserRole;
  avatarUrl?: string | null; // Agregado avatarUrl
}

export interface TeamLeader {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null; // Agregado avatarUrl
}