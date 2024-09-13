import './globals.css'
import { Inter } from 'next/font/google'
import { authenticateRequest } from "@/app/lib/auth.server"
import Navbar from "../components/NavBarAdmin"

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
  const user = await authenticateRequest()

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