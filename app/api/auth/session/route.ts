// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';

export async function GET() {
  const user = await authenticateRequest();
  if (user) {
    return NextResponse.json({ user });
  } else {
    return NextResponse.json(null);
  }
}