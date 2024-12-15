// types/auth.ts
import { z } from 'zod';

export type UserRole = 'user' | 'manager' | 'team_leader' | 'agent' | 'leader';

// Zod schema for UserRole
export const UserRoleSchema = z.enum(['user', 'manager', 'team_leader', 'agent', 'leader']);

// Token payload schema actualizado
export const TokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  isPasswordChanged: z.boolean(),
  iat: z.number().optional(),
  exp: z.number().optional()
});

// User schema actualizado
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: UserRoleSchema,
  isPasswordChanged: z.boolean(),
  name: z.string(),
  teamId: z.number().nullable(),
  userRole: UserRoleSchema.optional(),
  avatarUrl: z.string().nullable().optional() // Agregado avatarUrl
});

// Type interfaces derived from schemas
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
export type User = z.infer<typeof UserSchema>;