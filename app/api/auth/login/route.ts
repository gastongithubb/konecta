import { NextResponse } from 'next/server'
import { authenticateUser, createAccessToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await authenticateUser(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createAccessToken({ sub: user.email })
  return NextResponse.json({ access_token: token, token_type: 'bearer' })
}