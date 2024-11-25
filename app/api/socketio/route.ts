import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
      socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
    });
  }
  res.end();
};

export default SocketHandler;

export const config = {
  api: {
    bodyParser: false, // Ensure no body parsing for Socket.IO
  },
};
