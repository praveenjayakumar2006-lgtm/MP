
'use client';

import { useState } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
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
import { Bike } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function ParkingMap() {
  const [slots, setSlots] = useState<ParkingSlot[]>(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const { toast } = useToast();

  const carSlots = slots.filter((slot) => slot.type === 'car');
  const bikeSlots = slots.filter((slot) => slot.type === 'bike');

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

  const getSlotClasses = (slot: ParkingSlot) => {
    return cn(
      'relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-300 transform hover:scale-105',
      {
        'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200':
          slot.status === 'available',
        'bg-red-100 border-red-400 text-red-800 opacity-70 cursor-not-allowed':
          slot.status === 'occupied',
        'bg-blue-100 border-blue-400 text-blue-800 opacity-90 cursor-not-allowed':
          slot.status === 'reserved',
        'h-20 w-12': slot.type === 'car',
        'h-16 w-12': slot.type === 'bike',
      }
    );
  };

  const VehicleIcon = ({ type, className }: { type: 'car' | 'bike', className?: string }) => {
    let iconClass = cn(className);
    if (type === 'car') {
      iconClass = cn('h-1/2 w-1/2', className);
      return <Car className={iconClass} />;
    }
    iconClass = cn('h-2/3 w-2/3', className);
    return <Bike className={iconClass} />;
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="relative flex flex-col items-center border-2 border-gray-400 bg-gray-200 p-2 rounded-lg gap-2">
            
            <div className="flex flex-row gap-2">
                {carSlots.map((slot) => (
                <div
                    key={slot.id}
                    className={getSlotClasses(slot)}
                    onClick={() => handleSlotClick(slot)}
                    role="button"
                    tabIndex={slot.status === 'available' ? 0 : -1}
                    aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                >
                    {slot.status !== 'available' && (
                    <VehicleIcon type={slot.type} />
                    )}
                    <span className="absolute bottom-1 right-2 text-xs font-bold">
                    {slot.id}
                    </span>
                </div>
                ))}
            </div>

            <Separator className="my-2 bg-gray-400 h-1 w-full" />
            
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                {bikeSlots.slice(0, 4).map((slot) => (
                    <div
                    key={slot.id}
                    className={getSlotClasses(slot)}
                    onClick={() => handleSlotClick(slot)}
                    role="button"
                    tabIndex={slot.status === 'available' ? 0 : -1}
                    aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                    >
                    {slot.status !== 'available' && (
                        <VehicleIcon type={slot.type} />
                    )}
                    <span className="absolute bottom-1 right-1 text-xs font-bold">
                        {slot.id}
                    </span>
                    </div>
                ))}
                </div>
                <div className="flex flex-row gap-2">
                {bikeSlots.slice(4, 8).map((slot) => (
                    <div
                    key={slot.id}
                    className={getSlotClasses(slot)}
                    onClick={() => handleSlotClick(slot)}
                    role="button"
                    tabIndex={slot.status === 'available' ? 0 : -1}
                    aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                    >
                    {slot.status !== 'available' && (
                        <VehicleIcon type={slot.type} />
                    )}
                    <span className="absolute bottom-1 right-1 text-xs font-bold">
                        {slot.id}
                    </span>
                    </div>
                ))}
                </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
