
'use client';

import Link from 'next/link';
import { Car, Menu, ChevronDown, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/booking', label: 'Booking' },
  { href: '/violations', label: 'Report a Violation' },
];

const otherItems = [
    { href: '/reservations', label: 'My Bookings' },
    { href: '/feedback', label: 'Feedback' },
    { href: '/help', label: 'Help' },
];

export function AppHeader() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const { auth, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();


  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged out successfully.', duration: 2000 });
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to log out.' });
    }
  };

  const isOtherItemActive = otherItems.some(item => pathname.startsWith(item.href));

  const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
    const isActive = href === '/booking' ? pathname.startsWith('/booking') || pathname.startsWith('/select-spot') : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={cn(className, isActive ? "text-primary-foreground font-semibold" : "text-primary-foreground/80", "transition-colors hover:text-primary-foreground")}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 flex h-20 items-center justify-between border-b bg-primary text-primary-foreground px-8 md:px-12 z-50">
        <div className="flex items-center gap-4 text-lg font-semibold">
            <Link
            href="/home"
            className="flex items-center gap-4"
            >
            <Car className="h-12 w-12" />
            <span className="font-bold text-2xl">ParkEasy</span>
            </Link>
        </div>
        
        <nav className="hidden md:flex items-center justify-center gap-8 text-lg lg:gap-10 absolute left-1/2 -translate-x-1/2">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              className="font-medium"
            >
              {item.label}
            </NavLink>))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                    "flex items-center gap-1 text-lg font-medium transition-colors hover:text-primary-foreground hover:bg-white/10 p-2 rounded-md",
                    isOtherItemActive ? "text-primary-foreground font-semibold" : "text-primary-foreground/80"
                )}>
                    Others <ChevronDown className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                {otherItems.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
        <div className="flex items-center gap-4">
            {isClient && !isMobile && user && (
              <Button onClick={handleLogout} variant="ghost" size="icon" className="hover:bg-white/10 [&_svg]:size-8">
                  <LogOut className="text-primary-foreground/80 hover:text-primary-foreground" />
              </Button>
            )}
            {isClient && isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent border-primary-foreground/80 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="left">
                  <nav className="grid gap-6 text-xl font-medium">
                  <Link
                      href="/home"
                      className="flex items-center gap-2 text-lg font-semibold"
                  >
                      <Car className="h-6 w-6 text-primary" />
                      <span className="sr-only">ParkEasy</span>
                  </Link>
                  {navItems.map(item => (
                      <NavLink
                      key={item.href}
                      href={item.href}
                      className="transition-colors hover:text-foreground text-foreground"
                      >
                      {item.label}
                      </NavLink>
                  ))}
                  <div className="border-t pt-4">
                  {otherItems.map(item => (
                      <NavLink
                      key={item.href}
                      href={item.href}
                      className="block py-2 transition-colors hover:text-foreground text-muted-foreground"
                      >
                      {item.label}
                      </NavLink>
                  ))}
                  </div>
                  {user ? (
                    <Button onClick={handleLogout} variant="outline" className="w-full mt-4">Sign Out</Button>
                  ) : (
                    <Link href="/login">
                        <Button variant="outline" className="w-full mt-4">Sign In</Button>
                    </Link>
                  )}
                  </nav>
              </SheetContent>
            </Sheet>
             )}
        </div>
    </header>
  );
}
