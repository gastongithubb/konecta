// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { verifyRefreshToken, createAccessToken, createRefreshToken } from '@/app/lib/auth.server';

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const decodedToken = await verifyRefreshToken(refreshToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const newAccessToken = await createAccessToken({
      sub: decodedToken.sub,
      role: decodedToken.role,
      isPasswordChanged: decodedToken.isPasswordChanged
    });

    // Opcionalmente, puedes crear un nuevo refresh token cada vez
    const newRefreshToken = await createRefreshToken({
      sub: decodedToken.sub,
      role: decodedToken.role,
      isPasswordChanged: decodedToken.isPasswordChanged
    });

    const response = NextResponse.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

    response.cookies.set('auth_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Error refreshing token' }, { status: 500 });
  }
}