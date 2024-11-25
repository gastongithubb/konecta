// types/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';

// Tipos básicos para el servidor Socket.IO
export interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

export interface SocketWithIO extends Socket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// Tipos para los eventos del socket
export interface ServerToClientEvents {
  'notification:new': (data: NotificationData) => void;
  'case:update': (data: CaseUpdateData) => void;
  'case:new': (data: CaseData) => void;
  'error': (error: ErrorData) => void;
}

export interface ClientToServerEvents {
  'join-room': (userId: string) => void;
  'leave-room': (userId: string) => void;
  'typing': (data: TypingData) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  role: string;
}

// Tipos para los datos transmitidos
export interface NotificationData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  userId: string;
}

export interface CaseUpdateData {
  caseId: string;
  status: string;
  updatedBy: string;
  timestamp: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface CaseData {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface TypingData {
  userId: string;
  caseId: string;
  isTyping: boolean;
}

export interface ErrorData {
  code: string;
  message: string;
}

// Tipo para el cliente Socket.IO
export type TypedSocket = Socket &
  ClientToServerEvents &
  ServerToClientEvents &
  InterServerEvents &
  SocketData;
