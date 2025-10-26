
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {

  return (
    <div className="flex flex-col flex-1">
      <section id="home" className="flex flex-1 flex-col items-center justify-center text-center bg-background p-4">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <Car className="h-16 w-16 text-primary mx-auto" />
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Welcome to ParkEasy
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Your one-stop solution for hassle-free parking. Find and reserve your perfect spot in seconds.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Link href="/booking">
                <Button size="lg">Book a Slot</Button>
              </Link>
            </div>
            
            <div className="pt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tighter sm:text-3xl">Our Services</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-row items-start justify-center gap-12">
                    <div className="flex flex-col items-center gap-2 max-w-[200px]">
                      <Clock className="h-10 w-10 text-primary" />
                      <h3 className="font-semibold">Real-time Availability</h3>
                      <p className="text-sm text-muted-foreground">Check available spots instantly.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 max-w-[200px]">
                      <ShieldCheck className="h-10 w-10 text-primary" />
                      <h3 className="font-semibold">Secure Booking</h3>
                      <p className="text-sm text-muted-foreground">Reserve your spot with confidence.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 max-w-[200px]">
                      <AlertTriangle className="h-10 w-10 text-primary" />
                      <h3 className="font-semibold">Violation Reporting</h3>
                      <p className="text-sm text-muted-foreground">Easily report parking violations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
