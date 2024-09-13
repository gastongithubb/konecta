import React from 'react'
import Profile from '@/components/Profile'
import DashboardBase from '@/app/dashboard/DashboardBase'

export default function LoginPage() {
  const userRole: 'manager' | 'team_leader' | 'user' = 'user'; // Change this as needed

  return (
    <DashboardBase userRole={userRole}>
      <Profile />
    </DashboardBase>
  )
}