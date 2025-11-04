
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Reservation } from '@/lib/types';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getReservationsFromFile, saveReservationToFile, deleteReservationFromFile } from '@/app/reservations/actions';

interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => void;
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
    setIsLoading(true);
    const result = await getReservationsFromFile();
    if (result.success && result.data) {
      setReservations(result.data);
    } else {
      setReservations([]);
      console.error("Failed to fetch reservations:", result.message);
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if(isClient) {
      fetchReservations();
    }
  }, [isClient, fetchReservations]);

  const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to make a reservation.',
      });
      return;
    }
    
    const result = await saveReservationToFile({
      ...reservation,
      userId: user.uid,
    });

    if (result.success) {
      fetchReservations(); // Refetch all reservations to update the state
    } else {
      console.error("Error adding reservation: ", result.message);
       toast({
        variant: 'destructive',
        title: 'Reservation Error',
        description: 'Could not save your reservation. Please try again.',
      });
    }
  };

  const removeReservation = async (reservationId: string) => {
    const result = await deleteReservationFromFile(reservationId);
    if (result.success) {
      fetchReservations(); // Refetch to update the list
    } else {
      console.error("Error deleting reservation: ", result.message);
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
