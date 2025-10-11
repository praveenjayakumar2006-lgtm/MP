
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';


const bookingSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  startTime: z.string({
    required_error: 'A start time is required.',
  }),
  duration: z.string({
    required_error: 'A duration is required.',
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      label: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
    };
});

export default function HomePage() {
  const { toast } = useToast();
  const [showParkingMap, setShowParkingMap] = useState(false);
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  function onSubmit(values: BookingFormValues) {
    console.log(values);
    toast({
      title: 'Booking Details Submitted',
      description: 'Please select a parking slot to complete your reservation.',
    });
    setShowParkingMap(true);
  }

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
                <Link href="#booking">
                  <Button size="lg">Book a Slot</Button>
                </Link>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Book Your Spot</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Select your desired date, time, and duration to see available slots.
              </p>
            </div>
          </div>
          <Card className="max-w-3xl mx-auto">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                    )}
                                >
                                    {field.value ? (
                                    format(field.value, 'PPP')
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <Clock className="mr-2 h-4 w-4" />
                                  <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              {timeSlots.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                  </SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Duration (Hours)</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select hours" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                      <SelectItem key={hour} value={String(hour)}>
                                          {hour} hour{hour > 1 ? 's' : ''}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className='flex justify-center'>
                    <Button type="submit">Proceed to Select Slot</Button>
                </CardFooter>
            </form>
            </Form>
          </Card>

          <AnimatePresence>
            {showParkingMap && (
                 <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5 }}
                    className="mt-12"
                  >
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl">Select Your Spot</h3>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                      Select an available green slot from the map below to make an instant reservation.
                    </p>
                  </div>
                </div>
                <ParkingMap />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

