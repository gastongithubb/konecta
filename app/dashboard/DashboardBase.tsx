'use client'

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBarAdmin';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/Loading'

export type UserRole = 'manager' | 'team_leader' | 'user';

interface DashboardBaseProps {
  children: ReactNode;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    userRole: UserRole;
    isPasswordChanged: boolean;
    teamId: number | null;
  } | null;
}

const DashboardBase: React.FC<DashboardBaseProps> = ({ children, user: propUser }) => {
  const [user, setUser] = useState(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/user', {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();
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
  }, [router, propUser]);

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
      <Navbar user={user} />
      <main className="flex-grow bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function mapApiRoleToNavbarRole(apiRole: string): UserRole {
  switch (apiRole) {
    case 'manager': return 'manager';
    case 'team_leader': return 'team_leader';
    case 'user': return 'user';
    default:
      console.warn(`Unknown role: ${apiRole}. Defaulting to 'user'.`);
      return 'user';
  }
}

export default DashboardBase;