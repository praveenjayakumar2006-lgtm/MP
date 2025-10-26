
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Search, CalendarCheck, MapPin, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {

  return (
    <div className="flex flex-col flex-1">
      <section id="home" className="flex flex-col items-center justify-center text-center bg-background py-20 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-6">
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
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Parking Made Simple</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Reserve your parking spot in just three easy steps.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <div className="grid gap-1 text-center">
                <Search className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-bold">Find Parking</h3>
                <p className="text-sm text-muted-foreground">Enter your destination and desired time. View available spots on our interactive map.</p>
            </div>
            <div className="grid gap-1 text-center">
                <CalendarCheck className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-bold">Book Your Spot</h3>
                <p className="text-sm text-muted-foreground">Select your preferred spot, confirm your booking details, and pay securely.</p>
            </div>
            <div className="grid gap-1 text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-bold">Park with Ease</h3>
                <p className="text-sm text-muted-foreground">Navigate to your reserved spot with ease. No more circling the block!</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose ParkEasy?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    We offer a range of features to make your parking experience seamless.
                </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-bold">Real-Time Availability</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Our live map shows you exactly which spots are available right now.</p>
                </div>
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-bold">Secure Payments</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Pay for your parking quickly and securely through our app.</p>
                </div>
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <Car className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-bold">AI Violation Detection</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Our smart system helps keep parking fair by detecting and reporting violations.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
