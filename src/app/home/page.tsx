
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
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Services</h2>
                  <p className="text-muted-foreground mt-2">Everything you need for a seamless parking experience.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="flex justify-center">
                                <Clock className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Real-time Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Check available spots instantly before you even leave home.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                            <div className="flex justify-center">
                                <ShieldCheck className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Secure Booking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Reserve your spot with confidence using our secure payment system.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                            <div className="flex justify-center">
                                <AlertTriangle className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Violation Reporting</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Easily report parking violations to help maintain order.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
