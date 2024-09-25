// app/layout.tsx

import './globals.css'
import { Inter } from 'next/font/google'
import { authenticateRequest } from "@/app/lib/auth.server"
import Navbar from "../components/NavBarAdmin"
import { UserRole } from '@/types/user'
import ClientSessionProvider from './ClientSessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SancorSalud & Konecta',
  description: 'A dashboard for health metrics management',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticatedUser = await authenticateRequest()

  let user = null
  if (authenticatedUser) {
    const userRole: UserRole = (() => {
      switch (authenticatedUser.role) {
        case 'manager': return 'manager'
        case 'team_leader': return 'team_leader'
        case 'agent': return 'agent'
        default: return 'user'
      }
    })()

    user = {
      ...authenticatedUser,
      userRole
    }
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientSessionProvider>
          {user && <Navbar user={user} />}
          <main className="flex-grow">
            {children}
          </main>
        </ClientSessionProvider>
      </body>
    </html>
  )
}