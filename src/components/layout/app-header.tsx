
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  ParkingCircle,
  Book,
  MessageSquare,
  Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const navItems = [
  { href: '/', icon: ParkingCircle, label: 'View Parking' },
  { href: '/book-parking', icon: Book, label: 'Book Parking' },
  { href: '/reservations', icon: Book, label: 'View Bookings' },
  { href: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { href: '/violations', icon: Car, label: 'Violations' },
];

const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-foreground',
        isActive ? 'text-foreground' : 'text-muted-foreground',
        className
      )}
    >
      {children}
    </Link>
  );
};


export function AppHeader() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold">ParkSmart</span>
        </Link>
        {navItems.map(item => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}
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
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Car className="h-6 w-6 text-primary" />
              <span className="font-bold">ParkSmart</span>
            </Link>
             {navItems.map(item => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage
                            src={userAvatar?.imageUrl}
                            alt="User avatar"
                            data-ai-hint={userAvatar?.imageHint}
                        />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/login" passHref>
                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
