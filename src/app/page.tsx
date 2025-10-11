
import { ParkingMap } from '@/components/dashboard/parking-map';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section id="home" className="flex flex-col items-center justify-center text-center bg-muted/40 py-20 md:py-32 lg:py-40">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Car className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Welcome to ParkEasy
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                  Your one-stop solution for hassle-free parking. Find and reserve your perfect spot in seconds.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <a href="#booking">
                  <Button size="lg">Book a Slot</Button>
                </a>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              data-ai-hint="parking lot"
            />
          </div>
        </div>
      </section>

      <section id="booking" className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Find Your Spot</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Select an available green slot from the map below to make an instant reservation.
              </p>
            </div>
          </div>
          <ParkingMap />
        </div>
      </section>
    </div>
  );
}
