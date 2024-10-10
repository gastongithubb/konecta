// app/api/news/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAccessToken } from '@/app/lib/auth.server';


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
      const token = req.headers.get('Authorization')?.split(' ')[1];
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const decodedToken = await verifyAccessToken(token);
      if (!decodedToken || decodedToken.role !== 'team_leader') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { status } = await req.json();
      const updatedNews = await prisma.news.update({
        where: { id: params.id },
        data: { status },
      });
      return NextResponse.json(updatedNews);
    } catch (error) {
      console.error('Error updating news:', error);
      return NextResponse.json({ error: 'Error updating news' }, { status: 500 });
    }
  }