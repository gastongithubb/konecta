'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';
import { User } from '@/types/auth';

const NavbarPublic = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, []);

  // If user is logged in, don't show this navbar
  if (user) {
    return null;
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Placeholder for logo during hydration */}
              <div className="w-[120px] h-[40px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
            <div className="flex items-center">
              {/* Placeholder for theme toggle during hydration */}
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300">
      <div className="absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-gray-900/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <Image
                src={theme === 'dark' ? "/Logo-dark.png" : "/Logo.webp"}
                alt="Logo"
                width={120}
                height={40}
                priority
                className="mr-2 dark:brightness-200"
                unoptimized
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarPublic;