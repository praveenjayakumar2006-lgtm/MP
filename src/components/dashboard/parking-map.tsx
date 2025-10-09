
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
      variant: 'default',
    });

    setSelectedSlot(null);
  };

  const getSlotClasses = (status: ParkingSlot['status']) => {
    return cn(
      'relative flex flex-col items-center justify-center aspect-square rounded-md border-2 transition-all duration-300 transform hover:scale-105',
      {
        'bg-accent/20 border-accent text-accent-foreground cursor-pointer hover:bg-accent/40':
          status === 'available',
        'bg-destructive/20 border-destructive text-destructive-foreground opacity-70':
          status === 'occupied',
        'bg-primary/20 border-primary text-primary-foreground opacity-90':
          status === 'reserved',
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Parking Lot A</CardTitle>
          <CardDescription>
            Click on an available slot to reserve it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
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
              <div className="h-4 w-4 rounded-sm border-2 border-accent bg-accent/20" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border-2 border-primary bg-primary/20" />
              <span className="text-sm text-muted-foreground">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border-2 border-destructive bg-destructive/20" />
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
            <AlertDialogTitle>Confirm Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reserve parking slot{' '}
              <span className="font-bold text-foreground">
                {selectedSlot?.id}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleConfirmReservation}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
