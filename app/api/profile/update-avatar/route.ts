import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') ?? false;
  } catch {
    return false;
  }
}

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function hasValidImageExtension(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { avatarUrl } = await request.json();
    
    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format and extension
    if (!hasValidImageExtension(avatarUrl)) {
      return NextResponse.json(
        { error: 'URL must point to an image file (.jpg, .jpeg, .png, .gif, or .webp)' },
        { status: 400 }
      );
    }

    // Validate that URL points to an actual image
    if (!(await isValidImageUrl(avatarUrl))) {
      return NextResponse.json(
        { error: 'URL must point to a valid image' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { 
        id: session.id 
      },
      data: {
        avatarUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        avatarUrl: true
      }
    });

    return NextResponse.json({ 
      message: 'Avatar updated successfully',
      avatarUrl: updatedUser.avatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error updating avatar' },
      { status: 500 }
    );
  }
}