
'use client';

import Link from 'next/link';
import { Car, Menu, ChevronDown } from 'lucide-react';
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
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/home#home', label: 'Home' },
  { href: '/home#booking', label: 'Booking' },
];

const otherItems = [
    { href: '/reservations', label: 'My Bookings' },
    { href: '/feedback', label: 'Feedback' },
    { href: '/violations', label: 'AI Violations' },
];

export function AppHeader() {
  const pathname = usePathname();

  const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
    const isActive = pathname === href || (href.includes('#') && pathname === href.split('#')[0]);
    return (
      <Link
        href={href}
        className={cn(className, isActive ? "text-foreground" : "text-muted-foreground")}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <Link
          href="/home"
          className="flex items-center gap-2 text-xl font-semibold"
        >
          <Car className="h-7 w-7 text-primary" />
          <span className="font-bold">ParkEasy</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-center gap-5 text-base lg:gap-6">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              className="font-medium transition-colors hover:text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground">
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
            <Link href="/login">
                <Button variant="outline" className="hidden md:flex">Sign In</Button>
            </Link>
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
                    className="transition-colors hover:text-foreground"
                    >
                    {item.label}
                    </NavLink>
                ))}
                <div className="border-t pt-4">
                 {otherItems.map(item => (
                    <NavLink
                    key={item.href}
                    href={item.href}
                    className="block py-2 transition-colors hover:text-foreground"
                    >
                    {item.label}
                    </NavLink>
                ))}
                </div>
                 <Link href="/login">
                    <Button variant="outline" className="w-full mt-4">Sign In</Button>
                </Link>
                </nav>
            </SheetContent>
            </Sheet>
        </div>
    </header>
  );
}
