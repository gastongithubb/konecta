// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, createAccessToken } from '@/app/lib/auth.server';
import type { TokenPayload } from '@/types/auth';

export async function POST(request: Request) {
  try {
    // Get refresh token from cookies instead of request body
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 }
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
      isPasswordChanged: payload.isPasswordChanged
    };

    const accessToken = await createAccessToken(tokenData);
    
    const response = NextResponse.json(
      { accessToken },
      { status: 200 }
    );

    // Set new access token in cookies
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
      { error: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}