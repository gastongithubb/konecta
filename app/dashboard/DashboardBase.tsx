'use client'

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBarAdmin';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/Loading'

export type UserRole = 'manager' | 'team_leader' | 'agent' | 'user';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  userRole: UserRole;
  isPasswordChanged: boolean;
  teamId: number | null;
}

interface DashboardBaseProps {
  children: ReactNode;
  userRole?: UserRole;
}

const DashboardBase: React.FC<DashboardBaseProps> = ({ children, userRole: propUserRole }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!propUserRole);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (propUserRole) {
      // Set a minimal user object with default values
      setUser({
        id: 0,
        name: '',
        email: '',
        role: propUserRole,
        userRole: propUserRole,
        isPasswordChanged: true,
        teamId: null
      });
      setLoading(false);
    } else {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/user', {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData: User = await response.json();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to fetch user data. Please try logging in again.');
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [router, propUserRole]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!user) {
    return <div className="text-center">Unauthorized access. Please log in.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardBase;