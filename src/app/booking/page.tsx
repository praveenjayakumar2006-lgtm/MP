
'use client';

import { useRouter } from 'next/navigation';
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
import { format, isToday } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';

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

export default function BookingPage() {
  const router = useRouter();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDate = form.watch('date');

  function onSubmit(values: BookingFormValues) {
    console.log(values);
    router.push('/select-spot');
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <section id="booking" className="py-12 md:py-24 lg:py-32 flex flex-col items-center justify-center flex-1 bg-background">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Book Your Spot</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Select your desired date, time, and duration to see available slots.
              </p>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <Card className="max-w-3xl w-full">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                            <FormItem>
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
                                    onSelect={(date) => {
                                      field.onChange(date);
                                      form.resetField('startTime');
                                    }}
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <Clock className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {timeSlots.map((time) => {
                                  const [hour, minute] = time.value.split(':').map(Number);
                                  const isPast = selectedDate && isToday(selectedDate) && (hour < currentHour || (hour === currentHour && minute < currentMinute));
                                  return (
                                    <SelectItem key={time.value} value={time.value} disabled={isPast}>
                                      {time.label}
                                    </SelectItem>
                                  )
                                })}
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
          </div>
        </div>
      </section>
  )
}
