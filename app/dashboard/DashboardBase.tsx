'use client'

import React, { ReactNode } from 'react';
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';

interface DashboardBaseProps {
  children: ReactNode;
  userRole: 'manager' | 'team_leader' | 'user';
}

const DashboardBase: React.FC<DashboardBaseProps> = ({ children, userRole }) => {
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

export default DashboardBase;