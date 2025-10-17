
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
import { parkingSlots as initialSlots } from '@/lib/data';
import type { ParkingSlot } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useReservations } from '@/context/reservations-context';

export function ParkingMap() {
  const { reservations, addReservation, removeReservation } = useReservations();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [slotToCancel, setSlotToCancel] = useState<ParkingSlot | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize slots based on context reservations
    const userReservedSlotIds = new Set(reservations.map(r => r.slotId));
    const updatedSlots = initialSlots.map(slot => 
      userReservedSlotIds.has(slot.id)
        ? { ...slot, status: 'reserved' as const, reservedBy: 'user' as const }
        : slot
    );
    setSlots(updatedSlots);
  }, [reservations]);


  const carSlots = slots.filter((slot) => slot.type === 'car');
  const bikeSlots = slots.filter((slot) => slot.type === 'bike');

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setShowSuccess(false);
    } else if (slot.status === 'reserved' && slot.reservedBy === 'user') {
      setSlotToCancel(slot);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedSlot) return;

    setShowSuccess(true);

    const newReservation = {
      id: `RES-${Date.now()}`,
      slotId: selectedSlot.id,
      vehiclePlate: `USER-${Math.floor(Math.random() * 1000)}`,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'Active' as const,
    };
    addReservation(newReservation);


    setSlots((prevSlots) =>
      prevSlots.map((s) =>
        s.id === selectedSlot.id ? { ...s, status: 'reserved', reservedBy: 'user' } : s
      )
    );

    setTimeout(() => {
        setSelectedSlot(null);
        setShowSuccess(false);
    }, 1500)
  };
  
  const handleConfirmCancellation = () => {
    if (!slotToCancel) return;

    removeReservation(slotToCancel.id);

    setSlots((prevSlots) =>
      prevSlots.map((s) =>
        s.id === slotToCancel.id ? { ...s, status: 'available', reservedBy: undefined } : s
      )
    );

    toast({
        title: 'Reservation Cancelled',
        description: `Your reservation for slot ${slotToCancel.id} has been cancelled.`,
    });

    setSlotToCancel(null);
  }

  const getSlotClasses = (slot: ParkingSlot) => {
    return cn(
      'relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-300',
      {
        'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200':
          slot.status === 'available',
        'bg-red-100 border-red-400 text-red-800 opacity-70 cursor-not-allowed':
          slot.status === 'occupied',
        'bg-blue-100 border-blue-400 text-blue-800 opacity-90 cursor-not-allowed':
          slot.status === 'reserved' && slot.reservedBy !== 'user',
         'bg-yellow-100 border-yellow-400 text-yellow-800 cursor-pointer hover:bg-yellow-200':
          slot.status === 'reserved' && slot.reservedBy === 'user',
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
                    tabIndex={slot.status === 'available' || (slot.status === 'reserved' && slot.reservedBy === 'user') ? 0 : -1}
                    aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                >
                    {slot.status === 'reserved' && slot.reservedBy === 'user' && (
                       <>
                        <span className="absolute top-1 left-2 text-xs font-bold">You</span>
                        <VehicleIcon type={slot.type} />
                       </>
                    )}
                    {slot.status !== 'available' && slot.reservedBy !== 'user' && (
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
                     tabIndex={slot.status === 'available' || (slot.status === 'reserved' && slot.reservedBy === 'user') ? 0 : -1}
                    aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                    >
                    {slot.status === 'reserved' && slot.reservedBy === 'user' && (
                       <>
                        <span className="absolute top-1 left-2 text-xs font-bold">You</span>
                        <VehicleIcon type={slot.type} />
                       </>
                    )}
                    {slot.status !== 'available' && slot.reservedBy !== 'user' && (
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
                     tabIndex={slot.status === 'available' || (slot.status === 'reserved' && slot.reservedBy === 'user') ? 0 : -1}
                    aria-label={`Parking slot ${slot.id}, status: ${slot.status}`}
                    >
                    {slot.status === 'reserved' && slot.reservedBy === 'user' && (
                       <>
                        <span className="absolute top-1 left-2 text-xs font-bold">You</span>
                        <VehicleIcon type={slot.type} />
                       </>
                    )}
                    {slot.status !== 'available' && slot.reservedBy !== 'user' && (
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
              Are you sure you want to cancel your reservation for parking slot{' '}
              <span className="font-bold text-foreground">{slotToCancel?.id}</span>?
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
