
'use client';

import Link from 'next/link';
import { Car, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#booking', label: 'Booking' },
];

const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
  return (
    <a
      href={href}
      className={className}
    >
      {children}
    </a>
  );
};

export function AppHeader() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <div className="flex w-full items-center justify-between">
        <Link
          href="#home"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold">ParkEasy</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm lg:gap-6">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#home"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Car className="h-6 w-6 text-primary" />
                <span className="sr-only">ParkEasy</span>
              </Link>
              {navItems.map(item => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
