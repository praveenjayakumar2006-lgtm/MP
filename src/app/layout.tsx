
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/app-header';
import { Providers } from '@/components/layout/providers';
import { PageTransition } from '@/components/layout/page-transition';
import { ReservationsProvider } from '@/context/reservations-context';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// export const metadata: Metadata = {
//   title: 'ParkEasy',
//   description: 'Your one-stop solution for hassle-free parking.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showHeader = useMemo(() => {
    return !['/login', '/signup'].includes(pathname);
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ParkEasy</title>
        <meta name="description" content="Your one-stop solution for hassle-free parking." />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ReservationsProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted">
              {showHeader && <AppHeader />}
              <main className="flex flex-1 flex-col">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
            <Toaster />
          </ReservationsProvider>
        </Providers>
      </body>
    </html>
  );
}
