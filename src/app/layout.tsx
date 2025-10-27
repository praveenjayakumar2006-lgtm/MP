
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/app-header';
import { PageTransition } from '@/components/layout/page-transition';
import { ReservationsProvider } from '@/context/reservations-context';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { FirebaseClientProvider, useUser } from '@/firebase';
import Loading from './loading';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const isAuthPage = useMemo(() => ['/login', '/signup'].includes(pathname), [pathname]);
  const isOwnerPage = useMemo(() => pathname === '/owner', [pathname]);
  const isCameraPage = useMemo(() => pathname === '/violations/camera', [pathname]);

  const showHeader = useMemo(() => {
    if (!isClient || isCameraPage) return false;
    if (role === 'owner' && isOwnerPage) return true;
    if (role !== 'owner' && user && !isAuthPage) return true;
    return false;
  }, [role, isOwnerPage, user, isAuthPage, isClient, isCameraPage]);

  useEffect(() => {
    setIsClient(true);
    setRole(localStorage.getItem('role'));
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const currentRole = localStorage.getItem('role');
    setRole(currentRole);

    if (currentRole === 'owner') {
      if (!isOwnerPage) {
        router.replace('/owner');
      }
      return;
    }
    
    if (!isUserLoading) {
      if (user) { // Logged-in user
        if (isAuthPage) {
            router.replace('/home');
        }
      } else { // Logged-out user
        if (!isAuthPage && !isCameraPage) { // Allow camera page for logged-out users for now
          router.replace('/login');
        }
      }
    }
  }, [user, isUserLoading, isAuthPage, isOwnerPage, router, isClient, pathname, isCameraPage]);

  if (!isClient) {
    return <Loading />;
  }

  const currentRole = role; // Use state variable for consistent value in render
  if (currentRole === 'owner') {
    if (!isOwnerPage) return <Loading />;
  } else {
    if (isUserLoading && !isAuthPage) return <Loading />;
    if (!isUserLoading) {
      if (user && isAuthPage) return <Loading />;
      if (!user && !isAuthPage && !isCameraPage) return <Loading />;
    }
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
