
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/app-header';
import { PageTransition } from '@/components/layout/page-transition';
import { ReservationsProvider } from '@/context/reservations-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FirebaseClientProvider, useUser } from '@/firebase';
import Loading from './loading';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, []);

  const isAuthPage = useMemo(() => ['/login', '/signup'].includes(pathname), [pathname]);
  const isOwnerPage = useMemo(() => pathname === '/owner', [pathname]);
  const isHeaderlessPage = useMemo(() => ['/login', '/signup', '/owner', '/violations/camera', '/violations/uploading'].includes(pathname), [pathname]);

  useEffect(() => {
    const userRole = localStorage.getItem('role');

    if (!isUserLoading) {
      // If owner is trying to access non-owner pages, or vice versa
      if (userRole === 'owner' && !isOwnerPage && !isAuthPage) {
        router.replace('/owner');
        return;
      }

      if (user) {
        if (isAuthPage) {
            router.replace('/home');
        }
      } else if (!isAuthPage && userRole !== 'owner') {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, isAuthPage, isOwnerPage, router]);

  if (isUserLoading || (!user && !isAuthPage && role !== 'owner') || (user && isAuthPage)) {
    return <Loading />;
  }
  
  return (
    <>
      {!isHeaderlessPage && <AppHeader />}
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
