// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { authenticateUser, createAccessToken, createRefreshToken } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma';
import { TokenPayload } from '@/types/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

// Response data validation schema
const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.string(),
  isPasswordChanged: z.boolean()
});

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const tokenData: TokenPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      isPasswordChanged: user.isPasswordChanged  // Añadido este campo
    };

    const accessToken = await createAccessToken(tokenData);
    const refreshToken = await createRefreshToken(tokenData);

    // Validate user response data
    const validatedUserData = UserResponseSchema.parse({
      id: user.id,
      email: user.email,
      role: user.role,
      isPasswordChanged: user.isPasswordChanged
    });

    const response = NextResponse.json({ 
      user: validatedUserData
    });

    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 9 * 60 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Type guard for Zod error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data structure', details: error.errors },
        { status: 400 }
      );
    }
    
    // Generic error handling
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}