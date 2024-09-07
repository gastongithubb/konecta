import React from 'react'
import RegisterForm from '@/components/CreateUserForm'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-corporate-white">
      <RegisterForm />
    </main>
  )
}
