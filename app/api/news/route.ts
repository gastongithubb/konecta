// app/api/news/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAccessToken } from '@/app/lib/auth.server';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyAccessToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const news = await prisma.news.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        date: true,
        status: true,
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Error fetching news' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyAccessToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, url, date } = await req.json();
    if (!name || !url || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        name,
        url,
        date: new Date(date),
        creatorId: parseInt(decodedToken.sub, 10),
        status: 'active',
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Error creating news' }, { status: 500 });
  }
}