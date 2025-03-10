import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import { cookies } from 'next/headers';
import DashboardManagerClient from './DashboardManagerClient';

export default async function DashboardManager() {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      redirect('/login');
    }
    
    const decoded = await verifyAccessToken(token);
    
    if (!decoded || !decoded.sub) {
      redirect('/login');
    }
    
    // Pasamos decoded.sub como argumento a getUserData
    const user = await getUserData(decoded.sub);
    
    if (!user) {
      throw new Error('User not found');
    }

    return <DashboardManagerClient user={user} />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login');
  }
}