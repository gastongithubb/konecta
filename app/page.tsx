import React from 'react'
import LoginForm from '@/components/generales/Login'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-corporate-white">
      <LoginForm />
    </main>
  )
}
