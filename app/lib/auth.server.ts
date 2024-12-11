// lib/auth.server.ts
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { unstable_cache } from 'next/cache';
import { 
  User, 
  UserRole, 
  TokenPayload, 
  TokenPayloadSchema, 
  UserSchema,
  UserRoleSchema 
} from '@/types/auth';

const prisma = new PrismaClient();

// Role validation using Zod
function isValidUserRole(role: string): role is UserRole {
  const result = UserRoleSchema.safeParse(role);
  return result.success;
}

// Password utility functions
export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Base session function that accepts token as parameter
async function getSessionInternal(token: string | undefined): Promise<User | null> {
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.sub) },
      select: {
        id: true,
        email: true,
        role: true,
        isPasswordChanged: true,
        name: true,
        teamId: true
      }
    });

    if (!user || !isValidUserRole(user.role)) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      userRole: user.role, // Añadir userRole como alias de role
      isPasswordChanged: user.isPasswordChanged,
      name: user.name,
      teamId: user.teamId
    };
  } catch (error) {
    console.error('Error in getSessionInternal:', error);
    return null;
  }
}

// Enhanced getSession with caching
export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    return await unstable_cache(
      async (authToken: string | undefined) => getSessionInternal(authToken),
      ['user-session', token ?? 'no-token'],
      {
        revalidate: 3600,
        tags: ['session']
      }
    )(token);
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

// Token management functions
export async function createAccessToken(data: TokenPayload, expiresIn: string = '9h') {
  try {
    // Validate payload before creating token
    const validatedData = TokenPayloadSchema.parse(data);
    
    const secret = new TextEncoder().encode(process.env.SECRET_KEY!);
    return await new SignJWT({ ...validatedData })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(secret);
  } catch (error) {
    console.error('Error creating access token:', error);
    throw new Error('Failed to create access token');
  }
}

export async function createRefreshToken(data: TokenPayload, expiresIn: string = '7d') {
  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);
    return await new SignJWT({ ...data })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(secret);
  } catch (error) {
    console.error('Error creating refresh token:', error);
    throw new Error('Failed to create refresh token');
  }
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY!);
    const { payload } = await jwtVerify(token, secret);
    
    // Validate entire payload structure using Zod
    const validatedPayload = TokenPayloadSchema.parse(payload);
    return validatedPayload;
  } catch (error) {
    console.error('Error verifying access token:', error);
    return null;
  }
}


export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.sub || 
        typeof payload.email !== 'string' || 
        !isValidUserRole(payload.role as string)) {
      console.error('Invalid refresh token payload structure');
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
      isPasswordChanged: payload.isPasswordChanged as boolean, // Añadido este campo
      iat: payload.iat,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
}

export async function getUserData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPasswordChanged: true,
        teamId: true
      }
    });

    if (!user || !isValidUserRole(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isPasswordChanged: true,
        name: true,
        teamId: true
      }
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return null;
    }

    if (!isValidUserRole(user.role)) {
      console.error(`Invalid role found: ${user.role}`);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isPasswordChanged: user.isPasswordChanged,
      name: user.name,
      teamId: user.teamId
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}