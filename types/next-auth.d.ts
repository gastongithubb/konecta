// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      teamId?: number | null;
      role?: string;
      avatarUrl?: string | null; // Agregado avatarUrl
    }
  }
}