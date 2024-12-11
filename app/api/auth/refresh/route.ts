// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, createAccessToken } from '@/app/lib/auth.server';
import type { TokenPayload } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const tokenData: TokenPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      isPasswordChanged: payload.isPasswordChanged // Añadido este campo
    };

    const accessToken = await createAccessToken(tokenData);
    
    const response = NextResponse.json(
      { accessToken },
      { status: 200 }
    );

    response.cookies.set({
      name: 'auth_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 9 * 60 * 60, // 9 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Error refreshing token' },
      { status: 500 }
    );
  }
}