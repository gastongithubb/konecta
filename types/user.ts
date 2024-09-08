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