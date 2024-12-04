import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from "../components/generales/NavBarAdmin";
import ClientSessionProvider from './ClientSessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SancorSalud & Konecta',
  description: 'A dashboard for health metrics management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider>
          <ClientSessionProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pt-16">{children}</main>
            </div>
          </ClientSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}