'use client'

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBarAdmin';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/Loading'

export type UserRole = 'manager' | 'team_leader' | 'user';

interface DashboardBaseProps {
  children: ReactNode;
  userRole?: UserRole;
}

const DashboardBase: React.FC<DashboardBaseProps> = ({ children, userRole: propUserRole }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(propUserRole || null);
  const [loading, setLoading] = useState(!propUserRole);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (propUserRole) {
      setUserRole(propUserRole);
    } else {
      const fetchUserRole = async () => {
        try {
          const response = await fetch('/api/user-role', {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user role');
          }
          const data = await response.json();
          const mappedRole = mapApiRoleToNavbarRole(data.role);
          setUserRole(mappedRole);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setError('Failed to fetch user role. Please try logging in again.');
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };

      fetchUserRole();
    }
  }, [router, propUserRole]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!userRole) {
    return <div className="text-center">Unauthorized access. Please log in.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar userRole={userRole} />
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