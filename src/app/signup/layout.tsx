
import { Car } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background gap-6">
      <Link
          href="/home"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Car className="h-10 w-10 text-primary" />
          <span className="font-bold text-2xl">ParkEasy</span>
        </Link>
      {children}
    </div>
  );
}
