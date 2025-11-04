
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Reservation } from '@/lib/types';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

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
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'reservations');
  }, [firestore]);


  useEffect(() => {
    if (!reservationsQuery) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);

    const unsubscribe = onSnapshot(reservationsQuery, (snapshot) => {
        const fetchedReservations = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Make sure to convert Firestore Timestamps to JS Date objects
                startTime: data.startTime.toDate(),
                endTime: data.endTime.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Reservation;
        });
        setReservations(fetchedReservations);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching reservations in real-time: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch reservation data.',
        });
        setIsLoading(false);
    });

    return () => unsubscribe();

  }, [reservationsQuery, toast]);


  const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to make a reservation.',
      });
      return;
    }
    
    try {
        const reservationsCol = collection(firestore, 'reservations');
        await addDoc(reservationsCol, {
            ...reservation,
            userId: user.uid,
            status: 'Upcoming',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        // Real-time listener will handle the local state update
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
    if (!firestore) return;

    try {
        const reservationDoc = doc(firestore, 'reservations', reservationId);
        await deleteDoc(reservationDoc);
        // Real-time listener will handle the local state update
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
