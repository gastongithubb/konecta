// app/api/profile/update-avatar/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 5000; // 5 segundos

async function fetchWithTimeout(url: string, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(url, { method: 'HEAD' });
    if (!response.ok) return false;

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) return false;

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength);
      if (isNaN(size) || size > MAX_IMAGE_SIZE) return false;
    }

    // Verificación adicional para asegurar que la URL sea accesible
    const isHttps = url.startsWith('https://');
    if (!isHttps) return false;

    return true;
  } catch {
    return false;
  }
}

function hasValidImageExtension(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    // Verificaciones adicionales de seguridad
    if (!urlObj.protocol.startsWith('http')) return false;
    if (urlObj.username || urlObj.password) return false;
    
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
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { avatarUrl } = await request.json();
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere URL del avatar válida' },
        { status: 400 }
      );
    }

    // Validaciones de seguridad adicionales
    if (avatarUrl.length > 2048) {
      return NextResponse.json(
        { error: 'URL demasiado larga' },
        { status: 400 }
      );
    }

    if (!hasValidImageExtension(avatarUrl)) {
      return NextResponse.json(
        { error: 'La URL debe apuntar a un archivo de imagen (.jpg, .jpeg, .png, .gif, o .webp) y usar HTTPS' },
        { status: 400 }
      );
    }

    if (!(await isValidImageUrl(avatarUrl))) {
      return NextResponse.json(
        { error: 'La URL debe apuntar a una imagen válida, usar HTTPS y no exceder 5MB' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { avatarUrl },
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
      message: 'Avatar actualizado exitosamente',
      avatarUrl: updatedUser.avatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error al actualizar avatar' },
      { status: 500 }
    );
  }
}