// app/api/auth/me/route.ts
import { authenticateRequest } from '@/app/lib/auth.server'
import { prisma} from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await authenticateRequest()
  
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
    })
  }

  // Si el usuario es team_leader, incluir también los datos del equipo
  if (user.role === 'team_leader') {
    const team = await prisma.team.findFirst({
      where: {
        teamLeaderId: user.id
      },
      select: {
        id: true
      }
    })
    
    return NextResponse.json({
      ...user,
      teamLead: team
    })
  }

  return NextResponse.json(user)
}