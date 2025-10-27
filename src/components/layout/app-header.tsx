
'use client';

import Link from 'next/link';
import { Car, Menu, ChevronDown, Mail, Phone, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { Separator } from '@/components/ui/separator';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/booking', label: 'Booking' },
  { href: '/violations', label: 'Report a Violation' },
  { href: '/reservations', label: 'My Bookings' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/help', label: 'Help' },
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
        duration: 2000,
      });
      // The auth listener in the root layout will handle the redirect to /login
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'There was a problem signing you out. Please try again.',
      });
    }
  };


  const isOtherItemActive = otherItems.some(item => pathname.startsWith(item.href));

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

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

  const mainNavItems = [
    { href: '/home', label: 'Home' },
    { href: '/booking', label: 'Booking' },
    { href: '/violations', label: 'Report a Violation' },
  ];

  return (
    <header className="sticky top-0 flex h-20 items-center justify-between border-b bg-primary text-primary-foreground px-8 md:px-12 z-50">
        <div className="flex items-center gap-4 text-lg font-semibold">
            <Link
            href="/home"
            className="flex items-center gap-4"
            >
            <Car className="h-12 w-12" />
            <span className="font-bold text-3xl">ParkEasy</span>
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
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
             {user && (
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-lg font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground hover:bg-white/10"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              )}
          </div>
           
            {isClient && isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent border-primary-foreground/80 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                  <nav className="grid gap-6 text-xl font-medium">
                  <Link
                      href="/home"
                      onClick={handleLinkClick}
                      className="flex items-center gap-4 text-3xl font-semibold"
                  >
                      <Car className="h-10 w-10 text-primary" />
                      <span className="text-foreground">ParkEasy</span>
                  </Link>
                  <Separator className="my-2" />
                  {mainNavItems.map(item => (
                      <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="transition-colors hover:text-primary text-foreground"
                      >
                      {item.label}
                      </Link>
                  ))}
                  <div className="border-t pt-4">
                  {otherItems.map(item => (
                      <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="block py-2 transition-colors hover:text-primary text-foreground"
                      >
                      {item.label}
                      </Link>
                  ))}
                  </div>
                  </nav>
                  <div className="absolute bottom-6 left-6 right-6">
                    {user && (
                      <div className="mb-4">
                        <p className="text-center font-semibold text-foreground">{user.displayName}</p>
                        <Separator className="my-4" />
                        <Button
                          variant="destructive"
                          size="lg"
                          className="w-full text-lg"
                          onClick={() => {
                            handleSignOut();
                            handleLinkClick();
                          }}
                        >
                          <LogOut className="mr-2 h-5 w-5" />
                          Sign Out
                        </Button>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
                      <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold text-sm">Email Support</h4>
                            <p className="text-xs text-muted-foreground">
                                For general inquiries and support.
                            </p>
                            <a href="mailto:support@parkeasy.com" className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
                                support@parkeasy.com
                            </a>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                           <Phone className="h-5 w-5 mt-1 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold text-sm">Phone Support</h4>
                            <p className="text-xs text-muted-foreground">
                                Available 24/7 to assist you.
                            </p>
                            <a href="tel:+18001234567" className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
                                1-800-123-4567
                            </a>
                          </div>
                      </div>
                    </div>
                  </div>
              </SheetContent>
            </Sheet>
             )}
        </div>
    </header>
  );
}
