import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { 
  NextApiResponseWithSocket,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  TypingData  // Aseguramos que TypingData está importado
} from '../../types/socket';

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    // Aquí cambiamos a `res.socket.server as any` para evitar problemas de tipo
    const io = new SocketIOServer<
      ClientToServerEvents &
      ServerToClientEvents &
      InterServerEvents &
      SocketData
    >(res.socket.server as any, {  // Usamos 'as any' para el tipo de `res.socket.server`
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // El socket está tipado, por lo que tendrás autocompletado
      socket.on('join-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
      });

      // Asegúrate de que `data` esté correctamente tipado como `TypingData`
      socket.on('typing', (data: TypingData) => {
        socket.to(`case-${data.caseId}`).emit('typing', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  res.status(200).json({ message: 'Socket.IO server running' });
};

export default SocketHandler;

export const config = {
  api: {
    bodyParser: false
  }
};
