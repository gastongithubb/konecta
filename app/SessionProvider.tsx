// app/SessionProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';

interface SessionContextType {
  session: User | null;
  updateSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  updateSession: async () => {},
});

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context.session;
}

export function useUpdateSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useUpdateSession must be used within SessionProvider');
  }
  return context.updateSession;
}

export default function SessionProvider({ 
  session: initialSession, 
  children 
}: { 
  session: User | null; 
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<User | null>(initialSession);

  const updateSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data);
      
      // Disparar evento de actualización
      window.dispatchEvent(new CustomEvent('session-updated', { detail: data }));
      
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  };

  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
    }
  }, [initialSession]);

  return (
    <SessionContext.Provider value={{ session, updateSession }}>
      {children}
    </SessionContext.Provider>
  );
}