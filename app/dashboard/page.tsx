'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/Loading'

type UserRole = 'manager' | 'leader' | 'agent';

const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Asumimos que hay un endpoint para obtener el rol del usuario
          const response = await fetch('/api/user-role');
          const data = await response.json();
          setUserRole(data.role as UserRole);

          // Redirigir basado en el rol
          switch (data.role) {
            case 'manager':
              router.push('/dashboard/manager');
              break;
            case 'leader':
              router.push('/dashboard/leader');
              break;
            case 'agent':
              router.push('/dashboard/agent');
              break;
            default:
              router.push('/unauthorized');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          router.push('/error');
        }
      } else if (status === 'unauthenticated') {
        router.push('/login');
      }
    };

    checkUserRole();
  }, [status, session, router]);

  if (status === 'loading' || !userRole) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center py-4">
        {userRole === 'manager' ? 'Manager Dashboard' :
         userRole === 'leader' ? 'Leader Dashboard' :
         'Agent Dashboard'}
      </h1>
      {/* Aquí puedes añadir el contenido específico de cada dashboard */}
    </div>
  );
};

export default Dashboard;