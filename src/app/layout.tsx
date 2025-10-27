
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
    // This effect runs on the client and will re-run if path changes.
    // It's better to get the role here so it's fresh.
    setRole(localStorage.getItem('role'));
  }, [pathname]); // Depend on pathname to re-check role if user navigates

  const isAuthPage = useMemo(() => ['/login', '/signup'].includes(pathname), [pathname]);
  const isOwnerPage = useMemo(() => pathname === '/owner', [pathname]);

  useEffect(() => {
    // No need to get from localStorage again, use the state `role`
    if (role === 'owner') {
      if (!isOwnerPage) {
        router.replace('/owner');
      }
      return; // Early return for owner to prevent other checks
    }
    
    // The rest of the logic is for regular users
    if (!isUserLoading) {
      if (user) { // User is logged in
        if (isAuthPage) {
            router.replace('/home');
        }
      } else { // User is not logged in
        if (!isAuthPage) {
          router.replace('/login');
        }
      }
    }
  }, [user, isUserLoading, isAuthPage, isOwnerPage, router, role]);

  // Loading state logic
  if (role === 'owner' && !isOwnerPage) {
    return <Loading />;
  }
  if (role !== 'owner' && !isUserLoading) {
    if (user && isAuthPage) return <Loading />;
    if (!user && !isAuthPage) return <Loading />;
  }
  if (isUserLoading && !isAuthPage && role !== 'owner') {
     return <Loading />;
  }
  
  return (
    <>
      <AppHeader />
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
