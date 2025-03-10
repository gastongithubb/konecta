import React from 'react'
import Profile from '@/components/generales/Profile'
import DashboardBase from '../DashboardBase'

export default function LoginPage() {
  const userRole: 'manager' | 'team_leader' | 'user' = 'user'; // Change this as needed

  return (
    <DashboardBase userRole={userRole}>
      <Profile />
    </DashboardBase>
  )
}