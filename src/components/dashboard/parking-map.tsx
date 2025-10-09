
'use client';

import { useState } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { parkingSlots as initialSlots } from '@/lib/data';
import type { ParkingSlot } from '@/lib/types';
import Link from 'next/link';
import { Button } from '../ui/button';

export function ParkingMap() {
  const [slots, setSlots] = useState<ParkingSlot[]>(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const { toast } = useToast();

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedSlot) return;

    setSlots((prevSlots) =>
      prevSlots.map((s) =>
        s.id === selectedSlot.id ? { ...s, status: 'reserved' } : s
      )
    );

    toast({
      title: 'Reservation Successful!',
      description: `You have successfully reserved parking slot ${selectedSlot.id}.`,
    });

    setSelectedSlot(null);
  };

  const getSlotClasses = (status: ParkingSlot['status']) => {
    return cn(
      'relative flex flex-col items-center justify-center aspect-square rounded-md border-2 transition-all duration-300 transform hover:scale-105',
      {
        'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200':
          status === 'available',
        'bg-red-100 border-red-400 text-red-800 opacity-70':
          status === 'occupied',
        'bg-blue-100 border-blue-400 text-blue-800 opacity-90':
          status === 'reserved',
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parking Lot A</CardTitle>
              <CardDescription>
                Click an available slot to reserve, or book a slot for a future
                time.
              </CardDescription>
            </div>
            <Link href="/book-parking" passHref>
              <Button>Book a Slot</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-10">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={getSlotClasses(slot.status)}
                onClick={() => handleSlotClick(slot)}
                role="button"
                tabIndex={slot.status === 'available' ? 0 : -1}
                aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
              >
                {slot.status !== 'available' && (
                  <Car className="h-1/3 w-1/3" />
                )}
                <span className="absolute bottom-1 right-2 text-sm font-bold">
                  {slot.id}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border-2 border-green-400 bg-green-100" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border-2 border-blue-400 bg-blue-100" />
              <span className="text-sm text-muted-foreground">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border-2 border-red-400 bg-red-100" />
              <span className="text-sm text-muted-foreground">Occupied</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!selectedSlot}
        onOpenChange={(open) => !open && setSelectedSlot(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Instant Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reserve parking slot{' '}
              <span className="font-bold text-foreground">
                {selectedSlot?.id}
              </span>{' '}
              for right now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReservation}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
