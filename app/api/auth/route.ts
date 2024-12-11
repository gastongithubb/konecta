// app/api/auth/route.ts
import { authenticateUser, createAccessToken } from '@/app/lib/auth.server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = await createAccessToken({ 
    sub: user.id.toString(), 
    email: user.email,       // Añadir el email
    role: user.role, 
    isPasswordChanged: user.isPasswordChanged 
  });

  return new Response(JSON.stringify({ token }), { status: 200 });
}