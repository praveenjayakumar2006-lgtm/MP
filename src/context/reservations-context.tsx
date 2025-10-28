'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Reservation } from '@/lib/types';
import { useCollection, useFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, Timestamp, query, doc, where } from 'firebase/firestore';

interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => void;
  removeReservation: (reservationId: string) => void;
  isLoading: boolean;
  isClient: boolean;
}

export const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const reservationsQuery = useMemoFirebase(() => {
    if (firestore && user?.uid) {
      return query(collection(firestore, 'reservations'), where('userId', '==', user.uid));
    }
    return null;
  }, [firestore, user]);

  const { data: reservationsData, isLoading, error } = useCollection<Reservation>(reservationsQuery);
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (reservationsData) {
      const formattedReservations = reservationsData.map(r => ({
        ...r,
        startTime: (r.startTime as any).toDate(),
        endTime: (r.endTime as any).toDate(),
        createdAt: (r.createdAt as any)?.toDate(),
        updatedAt: (r.updatedAt as any)?.toDate(),
      }));
      setReservations(formattedReservations);
    } else if (!isLoading && user) {
        // If there's a user but no data, clear the reservations
        setReservations([]);
    }
  }, [reservationsData, user, isLoading]);

  const addReservation = (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => {
    if (!firestore || !user) return;
    
    const newReservation = {
      ...reservation,
      userId: user.uid,
      status: 'Upcoming' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      startTime: Timestamp.fromDate(reservation.startTime),
      endTime: Timestamp.fromDate(reservation.endTime),
    };
    
    addDocumentNonBlocking(collection(firestore, 'reservations'), newReservation);
  };

  const removeReservation = (reservationId: string) => {
    if (!firestore) return;
    const reservationDocRef = doc(firestore, 'reservations', reservationId);
    deleteDocumentNonBlocking(reservationDocRef);
  };

  if (error) {
    console.error("Error fetching reservations:", error);
  }

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, removeReservation, isLoading: isLoading, isClient }}>
      {children}
    </ReservationsContext.Provider>
  );
};
