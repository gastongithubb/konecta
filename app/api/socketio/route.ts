import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { NextResponse } from 'next/server';

// Crear un tipo extendido para NextResponse
type ExtendedResponse = NextResponse & {
  socket: {
    server: HttpServer & {
      io?: SocketIOServer
    }
  }
};

const initializeSocket = (res: ExtendedResponse) => {
  const server: HttpServer & { io?: SocketIOServer } = res.socket.server;

  if (!server.io) {
    console.log('Initializing new Socket.IO server...');
    const io = new SocketIOServer(server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
      });

      socket.on('typing', (data) => {
        socket.to(`case-${data.caseId}`).emit('typing', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    server.io = io;
  } else {
    console.log('Socket.IO server already running');
  }
};

// Manejo de la solicitud GET
export async function GET(req: NextRequest) {
  const res = NextResponse.next() as ExtendedResponse;

  // Asegurar que res tenga la estructura extendida necesaria
  res.socket = {
    server: res.socket?.server || {} as HttpServer & {
      io?: SocketIOServer
    }
  };

  initializeSocket(res);
  return NextResponse.json({ message: 'Socket.IO server running' });
}

// Manejo de la solicitud POST
export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Handling POST request' });
}

// Configuración dinámica del segmento de ruta
export const dynamic = 'force-dynamic';
