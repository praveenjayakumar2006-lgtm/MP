'use client';

import { useState, useEffect, useMemo } from 'react';
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
import type { ParkingSlot, Reservation } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { addHours, parse, format } from 'date-fns';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, Timestamp as FirestoreTimestamp, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type BookingDetails = {
  date: string;
  startTime: string;
  duration: string;
};

// A placeholder user ID. In a real app, this would come from an auth system.
const USER_ID = 'user-123';

export function ParkingMap({ bookingDetails }: { bookingDetails?: BookingDetails }) {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const reservationsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'reservations');
  }, [firestore]);

  const { data: reservations } = useCollection<Reservation>(reservationsQuery, {
    map: (r) => ({
      ...r,
      startTime: (r.startTime as unknown as FirestoreTimestamp).toDate(),
      endTime: (r.endTime as unknown as FirestoreTimestamp).toDate(),
    })
  });

  useEffect(() => {
    const getDesiredInterval = () => {
      if (!bookingDetails) return null;
      try {
        const baseDate = parse(bookingDetails.date.substring(0, 10), 'yyyy-MM-dd', new Date());
        const [hour, minute] = bookingDetails.startTime.split(':');
        baseDate.setHours(parseInt(hour, 10), parseInt(minute, 10));
        const start = baseDate;
        const end = addHours(start, parseInt(bookingDetails.duration, 10));
        return { start, end };
      } catch {
        return null;
      }
    };

    const desiredInterval = getDesiredInterval();

    const updatedSlots = defaultSlots.map((slot) => {
      let status: ParkingSlot['status'] = 'available';
      let reservedBy: ParkingSlot['reservedBy'] = undefined;
      let reservationId: string | undefined = undefined;

      const conflictingReservation = desiredInterval && reservations ? reservations.find((res) => {
        if (res.slotId !== slot.id) return false;
        const resStart = res.startTime;
        const resEnd = res.endTime;
        // Check for time overlap
        return desiredInterval.start < resEnd && desiredInterval.end > resStart;
      }) : undefined;
      
      if (conflictingReservation) {
        status = conflictingReservation.userId === USER_ID ? 'reserved' : 'occupied';
        reservedBy = conflictingReservation.userId === USER_ID ? 'user' : 'other';
        reservationId = conflictingReservation.id;
      } else {
        status = 'available';
      }
      
      const userOwnsThisSlotAtAnyTime = reservations?.find(r => r.slotId === slot.id && r.userId === USER_ID);

      // If available now, but user owns it at another time, show hint.
      if (status === 'available' && userOwnsThisSlotAtAnyTime) {
        reservedBy = 'user'; // For visual cue
        // Find the first upcoming or active reservation to allow cancellation
        reservationId = userOwnsThisSlotAtAnyTime.id;
      }

      // If the found conflict is the user's, ensure reservedBy is set to user for cancellation.
      if (status === 'reserved' || status === 'occupied') {
        if(conflictingReservation?.userId === USER_ID) {
          reservedBy = 'user';
        }
      }

      return { ...slot, status, reservedBy, reservationId };
    });

    setSlots(updatedSlots);
  }, [bookingDetails, reservations]);

  const handleSlotClick = (slot: ParkingSlot) => {
    // If the user owns the slot (either in conflict, or at a non-conflicting time),
    // prioritize cancellation if a reservationId is present.
    if (slot.reservedBy === 'user' && slot.reservationId) {
        const resToCancel = reservations?.find(r => r.id === slot.reservationId);
        if (resToCancel) {
            setReservationToCancel(resToCancel);
            // If the slot is also available at the desired time, don't return.
            // Allow booking flow to proceed if user cancels the dialog.
            if (slot.status !== 'available') {
              return;
            }
        }
    }
    
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
    if (!selectedSlot || !bookingDetails || !firestore) return;

    setShowSuccess(true);

    const { date, startTime, duration } = bookingDetails;
    const startDate = new Date(date);
    const [hour, minute] = startTime.split(':').map(Number);
    startDate.setHours(hour, minute, 0, 0);
    const endDate = addHours(startDate, parseInt(duration));

    const newReservation: Omit<Reservation, 'id'> = {
      userId: USER_ID,
      slotId: selectedSlot.id,
      vehiclePlate: `USER-${Math.floor(Math.random() * 1000)}`,
      startTime: startDate,
      endTime: endDate,
      status: 'Upcoming',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if(reservationsQuery) {
        addDocumentNonBlocking(reservationsQuery, newReservation);
    }


    setTimeout(() => {
      setSelectedSlot(null);
      setShowSuccess(false);
      toast({
        title: 'Reservation Successful!',
        description: `Slot ${selectedSlot.id} reserved for ${format(newReservation.startTime, 'MMM d, h:mm a')}.`,
      });
    }, 1500);
  };

  const handleConfirmCancellation = () => {
    if (!reservationToCancel || !firestore) return;

    const docRef = doc(firestore, 'reservations', reservationToCancel.id);
    deleteDocumentNonBlocking(docRef);

    toast({
      title: 'Reservation Cancelled',
      description: `Your reservation for slot ${reservationToCancel.slotId} has been cancelled.`,
    });

    setReservationToCancel(null);
  };

  const getSlotClasses = (slot: ParkingSlot) => {
    let isClickable = false;
    let baseClasses = '';

    switch (slot.status) {
      case 'available':
        isClickable = true;
         // If user owns it at a non-conflicting time, still show it as a user slot, but it's available.
         if (slot.reservedBy === 'user') {
            baseClasses = 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200';
        } else {
            baseClasses = 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200';
        }
        break;
      case 'occupied': // Reserved by someone else
        baseClasses = 'bg-red-100 border-red-400 text-red-800 opacity-70';
        break;
      case 'reserved': // Reserved by the current user (conflicting time)
        isClickable = true; // Clickable to cancel
        baseClasses = 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200';
        break;
      default:
        baseClasses = 'bg-gray-100 border-gray-400 text-gray-800';
    }

    return cn(
      'relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-300',
      baseClasses,
      isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
      {
        'h-24 w-16': slot.type === 'car',
        'h-20 w-16': slot.type === 'bike',
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
  
  const carSlots = slots.filter((slot) => slot.type === 'car');
  const bikeSlots = slots.filter((slot) => slot.type === 'bike');

  const showVehicleIcon = (slot: ParkingSlot) => {
    // Show icon if occupied by others, or reserved by the user at a conflicting time
    if (slot.status === 'occupied' || slot.status === 'reserved') {
      return true;
    }
    // Also show if available now, but user owns it at another time (visual hint)
    if (slot.status === 'available' && slot.reservedBy === 'user') {
      return true;
    }
    return false;
  }

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
                  {showVehicleIcon(slot) && (
                    <>
                      {slot.reservedBy === 'user' && <span className="absolute top-1 left-1 text-xs font-bold">You</span>}
                      <VehicleIcon type={slot.type} />
                    </>
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
                    {showVehicleIcon(slot) && (
                      <>
                        {slot.reservedBy === 'user' && <span className="absolute top-1 left-1 text-xs font-bold">You</span>}
                        <VehicleIcon type={slot.type} />
                      </>
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
                    {showVehicleIcon(slot) && (
                      <>
                        {slot.reservedBy === 'user' && <span className="absolute top-1 left-1 text-xs font-bold">You</span>}
                        <VehicleIcon type={slot.type} />
                      </>
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
              <span className="text-sm text-muted-foreground">Your Reservation (Conflicting)</span>
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
          if (!open) {
            setSelectedSlot(null);
            setShowSuccess(false);
          }
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
                  <span className="font-bold text-foreground">{selectedSlot?.id}</span>{' '}
                  for your selected time?
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

      <AlertDialog
        open={!!reservationToCancel}
        onOpenChange={(open) => {
          if (!open) {
            setReservationToCancel(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your reservation for parking slot{' '}
              <span className="font-bold text-foreground">{reservationToCancel?.slotId}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmCancellation}
            >
              Cancel Reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    