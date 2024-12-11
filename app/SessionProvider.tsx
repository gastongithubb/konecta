'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';

export const SessionContext = createContext<User | null>(null);

export function useSession() {
  return useContext(SessionContext);
}

interface SessionProviderProps {
  session: User | null;
  children: React.ReactNode;
}

export default function SessionProvider({ session: initialSession, children }: SessionProviderProps) {
  const [session, setSession] = useState(initialSession);
  const router = useRouter();

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  // Este efecto ya no es tan necesario en Next.js 15 pero puede mantenerse como fallback
  useEffect(() => {
    if (!session) {
      const checkSession = async () => {
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const data = await response.json();
            setSession(data);
            router.refresh();
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      };
      checkSession();
    }
  }, [session, router]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}