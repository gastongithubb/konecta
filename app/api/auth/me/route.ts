// app/api/auth/me/route.ts
import { authenticateRequest } from '@/app/lib/auth.server'
import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await authenticateRequest()
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }), 
        { status: 401 }
      )
    }

    let userData = null

    switch (user.role) {
      case 'team_leader':
        userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            teamId: true,
            leadTeams: {
              select: {
                id: true,
                name: true,
                members: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        })
        break

      case 'manager':
        userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managedTeams: {
              select: {
                id: true,
                name: true,
                teamLeader: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        })
        break

      default:
        userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
                teamLeader: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        })
    }

    if (!userData) {
      return new NextResponse(
        JSON.stringify({ error: 'Usuario no encontrado' }), 
        { status: 404 }
      )
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Error en /api/auth/me:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener datos del usuario' }), 
      { status: 500 }
    )
  }
}