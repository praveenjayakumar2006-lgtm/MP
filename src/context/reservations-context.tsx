
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Reservation } from '@/lib/types';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getReservations, saveReservation, deleteReservation } from '@/app/actions/reservations';
import { addHours, parseISO } from 'date-fns';


interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status' | 'userName'> & { startTime: Date, endTime: Date }) => void;
  removeReservation: (reservationId: string) => void;
  isLoading: boolean;
  isClient: boolean;
}

export const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      // Always fetch all reservations. Filtering will be done in components.
      const fetchedReservations = await getReservations();
      setReservations(fetchedReservations as Reservation[]);
    } catch (error) {
      console.error("Error fetching reservations: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch reservation data.',
      });
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [toast, isLoading]);

  useEffect(() => {
    if (isClient) {
      fetchReservations(); // Initial fetch

      const intervalId = setInterval(() => {
        fetchReservations();
      }, 1000); // Poll every 1 second

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [isClient, fetchReservations]);


  const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status' | 'userName'> & { startTime: Date, endTime: Date }) => {
    if (!user || !user.displayName) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to make a reservation.',
      });
      return;
    }
    
    // Find if there's an existing reservation for the same slot and time by the same user
    const existingReservation = reservations.find(
      (r) => r.slotId === reservation.slotId && r.userId === user.uid
    );

    if (existingReservation) {
       try {
        await deleteReservation(existingReservation.id);
      } catch (error) {
         console.error("Error deleting existing reservation: ", error);
      }
    }
    
    try {
      await saveReservation({
        ...reservation,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
        userId: user.uid,
        userName: user.displayName,
      });
      await fetchReservations(); // Refetch after adding
    } catch (error) {
       console.error("Error adding reservation: ", error);
       toast({
        variant: 'destructive',
        title: 'Reservation Error',
        description: 'Could not save your reservation. Please try again.',
      });
    }
  };

  const removeReservation = async (reservationId: string) => {
    try {
      await deleteReservation(reservationId);
      await fetchReservations(); // Refetch after deleting
    } catch (error) {
       console.error("Error deleting reservation: ", error);
      toast({
        variant: 'destructive',
        title: 'Cancellation Error',
        description: 'Could not cancel your reservation. Please try again.',
      });
    }
  };

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, removeReservation, isLoading, isClient }}>
      {children}
    </ReservationsContext.Provider>
  );
};
