// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { verifyRefreshToken, createAccessToken, createRefreshToken } from '@/app/lib/auth.server';

export async function POST(req: Request) {
  try {
    const refreshToken = req.headers.get('Cookie')?.split('; ').find(row => row.startsWith('refresh_token='))?.split('=')[1];
    
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

    const newRefreshToken = await createRefreshToken({
      sub: decodedToken.sub,
      role: decodedToken.role,
      isPasswordChanged: decodedToken.isPasswordChanged
    });

    const response = NextResponse.json({ accessToken: newAccessToken });

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Error refreshing token' }, { status: 500 });
  }
}