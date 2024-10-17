import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAccessToken } from '@/app/lib/auth.server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyAccessToken(token);
    if (!decodedToken || decodedToken.role !== 'team_leader') {
      return NextResponse.json({ error: 'Unauthorized - Team leader access required' }, { status: 401 });
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyAccessToken(token);
    if (!decodedToken || decodedToken.role !== 'team_leader') {
      return NextResponse.json({ error: 'Unauthorized - Team leader access required' }, { status: 401 });
    }

    await prisma.news.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'News deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Error deleting news' }, { status: 500 });
  }
}