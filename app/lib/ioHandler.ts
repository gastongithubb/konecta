import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  TypingData
} from '@/types/socket';

type ExtendedNextApiResponse = NextApiResponse & {
  socket: {
    server: {
      io?: SocketIOServer
    }
  }
};

const ioHandler = (req: NextApiRequest, res: ExtendedNextApiResponse) => {
  if (!res.socket.server.io) {
    console.log('Initializing new Socket.IO server...');
    const io = new SocketIOServer<
      ClientToServerEvents &
      ServerToClientEvents &
      InterServerEvents &
      SocketData
    >(res.socket.server as any, {
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

      socket.on('typing', (data: TypingData) => {
        socket.to(`case-${data.caseId}`).emit('typing', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already running');
  }
};

export default ioHandler;
