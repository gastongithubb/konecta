import './globals.css'
import { Inter } from 'next/font/google'
import { authenticateRequest } from "@/app/lib/auth.server"
import Navbar from "../components/NavBarAdmin"
import { UserRole } from '@/types/user' // Asegúrate de que esta importación sea correcta

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
    // Mapear el role a userRole
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
        {user && <Navbar user={user} />}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  )
}