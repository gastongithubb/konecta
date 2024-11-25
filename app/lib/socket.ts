import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
  path: '/api/socketio',
  transports: ['websocket', 'polling'],
  reconnection: true,
});
