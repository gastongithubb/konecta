// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import SessionProvider from './SessionProvider';
import NavbarAdmin from '@/components/generales/NavBarAdmin';
import { getSession } from '@/app/lib/auth.server';
import Template from '@/components/Template'


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SancorSalud & Konecta',
  description: 'A dashboard for health metrics management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider session={session}>
            <div className="relative flex min-h-screen flex-col">
              <NavbarAdmin />
              <main className="flex-1 pt-16"><Template>{children}</Template></main>
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}