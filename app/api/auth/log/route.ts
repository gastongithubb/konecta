// app/api/auth/_log/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  console.log('Auth log:', body);
  return NextResponse.json({ status: 'logged' });
}