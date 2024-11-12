import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from "../components/generales/NavBarAdmin"
import ClientSessionProvider from './ClientSessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SancorSalud & Konecta',
  description: 'A dashboard for health metrics management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientSessionProvider>
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
        </ClientSessionProvider>
      </body>
    </html>
  )
}