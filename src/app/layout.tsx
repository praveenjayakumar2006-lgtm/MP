
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/app-header';
import { PageTransition } from '@/components/layout/page-transition';
import { ReservationsProvider } from '@/context/reservations-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { FirebaseClientProvider, useUser } from '@/firebase';
import Loading from './loading';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const isAuthPage = useMemo(() => ['/login', '/signup'].includes(pathname), [pathname]);
  const showHeader = useMemo(() => !isAuthPage, [isAuthPage]);

  useEffect(() => {
    if (!isUserLoading) {
      if (user && isAuthPage) {
        router.replace('/home');
      } else if (!user && !isAuthPage) {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, isAuthPage, router]);

  if (isUserLoading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return <Loading />;
  }

  return (
    <>
      {showHeader && <AppHeader />}
      <main className="flex flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ParkEasy</title>
        <meta name="description" content="Your one-stop solution for hassle-free parking." />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <FirebaseClientProvider>
          <ReservationsProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted">
              <AppContent>{children}</AppContent>
            </div>
            <Toaster />
          </ReservationsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
