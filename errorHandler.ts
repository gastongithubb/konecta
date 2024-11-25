// middleware/errorHandler.ts
import { NextApiRequest, NextApiResponse } from 'next';

export function errorHandler(err: any, req: NextApiRequest, res: NextApiResponse) {
  console.error('API Error:', err);

  if (err.code === 'ERR_JWT_EXPIRED') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please refresh your authentication token'
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
}