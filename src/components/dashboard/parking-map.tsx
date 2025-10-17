'use client';

import { useState, useEffect } from 'react';
import { Car, Bike, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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
import { parkingSlots as defaultSlots } from '@/lib/data';
import type { ParkingSlot } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

type BookingDetails = {
  date: string;
  startTime: string;
  duration: string;
};

export function ParkingMap({ bookingDetails }: { bookingDetails?: BookingDetails }) {
  const [slots, setSlots] = useState<ParkingSlot[]>(defaultSlots);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
        if (!bookingDetails) {
            toast({
              variant: 'destructive',
              title: 'Booking Time Required',
              description: 'Please go back to the booking page and select a date, time, and duration.',
            });
            return;
        }
      setSelectedSlot(slot);
      setShowSuccess(false);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedSlot) return;

    setShowSuccess(true);

    setTimeout(() => {
      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.id === selectedSlot.id
            ? { ...s, status: 'reserved', reservedBy: 'user' }
            : s
        )
      );
      setSelectedSlot(null);
      setShowSuccess(false);
      toast({
        title: 'Reservation Successful!',
        description: `Slot ${selectedSlot.id} is now yours.`,
      });
    }, 1500);
  };

  const getSlotClasses = (slot: ParkingSlot) => {
    return cn(
      'relative flex flex-col items-center justify-center rounded-md border-2 transition-colors',
      {
        'bg-green-100 border-green-400 text-green-800 hover:bg-green-200 cursor-pointer':
          slot.status === 'available',
        'bg-red-100 border-red-400 text-red-800 cursor-not-allowed opacity-70':
          slot.status === 'occupied',
        'bg-yellow-100 border-yellow-400 text-yellow-800 cursor-not-allowed':
          slot.status === 'reserved',
        'h-24 w-16': slot.type === 'car',
        'h-20 w-16': slot.type === 'bike',
      }
    );
  };

  const VehicleIcon = ({ type }: { type: 'car' | 'bike' }) => {
    if (type === 'car') {
      return <Car className="h-1/2 w-1/2" />;
    }
    return <Bike className="h-2/3 w-2/3" />;
  };

  const carSlots = slots.filter((slot) => slot.type === 'car');
  const bikeSlots = slots.filter((slot) => slot.type === 'bike');

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="relative flex flex-col items-center border-2 border-gray-400 bg-gray-200 p-2 rounded-lg gap-4">
            <div className="flex flex-row gap-4">
              {carSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={getSlotClasses(slot)}
                  onClick={() => handleSlotClick(slot)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                >
                  {(slot.status === 'occupied' || slot.status === 'reserved') && (
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
                <div className="flex flex-row gap-4">
                    {bikeSlots.slice(0, 5).map((slot) => (
                    <div
                        key={slot.id}
                        className={getSlotClasses(slot)}
                        onClick={() => handleSlotClick(slot)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                    >
                        {(slot.status === 'occupied' || slot.status === 'reserved') && (
                        <VehicleIcon type={slot.type} />
                        )}
                        <span className="absolute bottom-1 right-1 text-xs font-bold">
                        {slot.id}
                        </span>
                    </div>
                    ))}
                </div>
                 <div className="flex flex-row gap-4">
                    {bikeSlots.slice(5, 10).map((slot) => (
                    <div
                        key={slot.id}
                        className={getSlotClasses(slot)}
                        onClick={() => handleSlotClick(slot)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                    >
                        {(slot.status === 'occupied' || slot.status === 'reserved') && (
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
              <div className="h-4 w-4 rounded-sm border-2 border-yellow-400 bg-yellow-100" />
              <span className="text-sm text-muted-foreground">Your Reservation</span>
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
        onOpenChange={(open) => {
          if (!open) setSelectedSlot(null);
        }}
      >
        <AlertDialogContent>
          {showSuccess ? (
             <div className="flex flex-col items-center justify-center p-8 gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ duration: 0.5, type: 'spring' }}>
                  <CheckCircle2 className="h-24 w-24 text-green-500" />
              </motion.div>
              <AlertDialogTitle>Reservation Successful!</AlertDialogTitle>
              <AlertDialogDescription>
                Parking slot <span className="font-bold text-foreground">{selectedSlot?.id}</span> is now yours.
              </AlertDialogDescription>
            </div>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Reservation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reserve parking slot{' '}
                  <span className="font-bold text-foreground">{selectedSlot?.id}</span>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmReservation}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
