// hooks/useSocket.ts
'use client'
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIo = io(process.env.NEXT_PUBLIC_API_URL || '', {
      path: '/api/socketio',
    });

    socketIo.on('connect', () => {
      console.log('Connected to WebSocket');
      socketIo.emit('join-room', userId);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [userId]);

  return socket;
};