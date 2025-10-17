
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Reservation } from '@/lib/types';

interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  removeReservation: (slotId: string) => void;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export function ReservationsProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const addReservation = (reservation: Reservation) => {
    setReservations((prev) => [...prev, reservation]);
  };

  const removeReservation = (slotId: string) => {
    setReservations((prev) => prev.filter((res) => res.slotId !== slotId));
  };

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, removeReservation }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
}
