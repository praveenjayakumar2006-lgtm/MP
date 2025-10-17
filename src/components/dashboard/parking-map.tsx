
'use client';

import { useState, useEffect } from 'react';
import { Car, Bike, CheckCircle2 } from 'lucide-react';
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
import { parkingSlots as defaultSlots, reservations as otherReservations } from '@/lib/data';
import type { ParkingSlot, Reservation } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useReservations } from '@/context/reservations-context';
import { addHours, parse, format } from 'date-fns';

type BookingDetails = {
    date: string;
    startTime: string;
    duration: string;
}

export function ParkingMap({ bookingDetails }: { bookingDetails?: BookingDetails }) {
  const { reservations: userReservations, addReservation, removeReservation } = useReservations();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [slotToCancel, setSlotToCancel] = useState<ParkingSlot | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const allReservations = [...userReservations, ...otherReservations];
    
    const getDesiredInterval = () => {
        if (!bookingDetails) return null;
        try {
            const baseDate = parse(bookingDetails.date.substring(0,10), 'yyyy-MM-dd', new Date());
            const [hour, minute] = bookingDetails.startTime.split(':');
            baseDate.setHours(parseInt(hour), parseInt(minute));
            
            const start = baseDate;
            const end = addHours(start, parseInt(bookingDetails.duration));
            return { start, end };
        } catch {
            return null;
        }
    }

    const desiredInterval = getDesiredInterval();

    const updatedSlots = defaultSlots.map(slot => {
        let status: ParkingSlot['status'] = 'available';
        let reservedBy: ParkingSlot['reservedBy'] = undefined;

        const conflictingReservation = desiredInterval ? allReservations.find(res => {
            if (res.slotId !== slot.id) return false;
            const resStart = new Date(res.startTime);
            const resEnd = new Date(res.endTime);
            // Check for overlap: (StartA < EndB) and (EndA > StartB)
            return desiredInterval.start < resEnd && desiredInterval.end > resStart;
        }) : undefined;
        
        if (conflictingReservation) {
            const isUserReservation = userReservations.some(r => r.id === conflictingReservation.id);
            if (isUserReservation) {
                status = 'reserved';
                reservedBy = 'user';
            } else {
                const isOccupied = otherReservations.some(r => r.id === conflictingReservation.id && r.status === 'Active');
                status = isOccupied ? 'occupied' : 'reserved';
                reservedBy = 'other';
            }
        } else {
            // No time conflict for the desired slot. The slot is available for booking.
            status = 'available';
            // We can still give a hint if the user owns this slot for a *different* time.
             const userOwnsThisSlot = userReservations.some(r => r.slotId === slot.id);
             if (userOwnsThisSlot) {
                reservedBy = 'user';
             }
        }
        
        return { ...slot, status, reservedBy };
    });
    
    setSlots(updatedSlots);

  }, [bookingDetails, userReservations]);


  const carSlots = slots.filter((slot) => slot.type === 'car');
  const bikeSlots = slots.filter((slot) => slot.type === 'bike');

  const handleSlotClick = (slot: ParkingSlot) => {
    // If the slot is one of the user's, always give cancellation option.
    const isOwnedByUser = userReservations.some(r => r.slotId === slot.id);
    if (isOwnedByUser) {
      setSlotToCancel(slot);
      return;
    }
    
    // If the slot is available, allow booking.
    if (slot.status === 'available') {
      if (!bookingDetails) {
        toast({
            variant: 'destructive',
            title: 'Booking Time Required',
            description: 'Please go back to the booking page and select a date, time, and duration.',
        })
        return;
      }
      setSelectedSlot(slot);
      setShowSuccess(false);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedSlot || !bookingDetails) return;

    setShowSuccess(true);
    
    const { date, startTime, duration } = bookingDetails;
    const startDate = new Date(date);
    const [hour, minute] = startTime.split(':').map(Number);
    startDate.setHours(hour, minute, 0, 0);

    const newReservation: Reservation = {
      id: `RES-${Date.now()}`,
      slotId: selectedSlot.id,
      vehiclePlate: `USER-${Math.floor(Math.random() * 1000)}`,
      startTime: startDate,
      endTime: addHours(startDate, parseInt(duration)),
      status: 'Upcoming' as const,
    };
    addReservation(newReservation);

    setTimeout(() => {
        setSelectedSlot(null);
        setShowSuccess(false);
        toast({
            title: 'Reservation Successful!',
            description: `Slot ${selectedSlot.id} reserved for ${format(newReservation.startTime, 'MMM d, h:mm a')}.`,
        })
    }, 1500)
  };
  
  const handleConfirmCancellation = () => {
    if (!slotToCancel) return;

    // Here we remove ALL reservations for this slotId made by the user.
    // A more advanced implementation might let you pick which one to cancel.
    removeReservation(slotToCancel.id);

    toast({
        title: 'Reservation Cancelled',
        description: `Your reservation(s) for slot ${slotToCancel.id} have been cancelled.`,
    });

    setSlotToCancel(null);
  }

  const getSlotClasses = (slot: ParkingSlot) => {
    let isClickable = false;
    let baseClasses = '';

    switch (slot.status) {
        case 'available':
            isClickable = true;
            // If user owns it at a non-conflicting time, still show it as a user slot, but it's available.
            if (slot.reservedBy === 'user') {
                baseClasses = 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200';
            } else {
                baseClasses = 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200';
            }
            break;
        case 'occupied':
            baseClasses = 'bg-red-100 border-red-400 text-red-800 opacity-70';
            break;
        case 'reserved':
             // If reserved by user for the conflicting time, it's a user slot. Clickable to cancel.
            if (slot.reservedBy === 'user') {
                isClickable = true; 
                baseClasses = 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200';
            } else { // Reserved by someone else at the desired time.
                baseClasses = 'bg-blue-100 border-blue-400 text-blue-800 opacity-90';
            }
            break;
        default:
            baseClasses = 'bg-gray-100 border-gray-400 text-gray-800';
            break;
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
  
  const showVehicleIcon = (slot: ParkingSlot) => {
    if (slot.status === 'occupied' || slot.status === 'reserved') {
        return true;
    }
    // Also show if it's available now, but user owns it at a different time
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
                        {slot.reservedBy === 'user' && <span className="absolute top-1 left-2 text-xs font-bold">You</span>}
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
                        {slot.reservedBy === 'user' && <span className="absolute top-1 left-2 text-xs font-bold">You</span>}
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
                        {slot.reservedBy === 'user' && <span className="absolute top-1 left-2 text-xs font-bold">You</span>}
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
              <span className="text-sm text-muted-foreground">Your Reservation</span>
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
                    <span className="font-bold text-foreground">
                        {selectedSlot?.id}
                    </span>{' '}
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
        open={!!slotToCancel}
        onOpenChange={(open) => {
          if (!open) {
            setSlotToCancel(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel all your reservations for parking slot{' '}
              <span className="font-bold text-foreground">{slotToCancel?.id}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmCancellation}
            >
              Cancel Reservation(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    