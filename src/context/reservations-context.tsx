
'use client';

import React, { createContext, useState, ReactNode } from 'react';
import type { Reservation } from '@/lib/types';

const mockReservations: Reservation[] = [
    {
        id: '1',
        slotId: 'C2',
        userId: 'user-123',
        vehiclePlate: 'USER-195',
        startTime: new Date('2025-10-17T21:00:00'),
        endTime: new Date('2025-10-17T22:00:00'),
        status: 'Upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        slotId: 'B3',
        userId: 'user-123',
        vehiclePlate: 'USER-163',
        startTime: new Date('2025-10-17T21:00:00'),
        endTime: new Date('2025-10-17T22:00:00'),
        status: 'Upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  removeReservation: (reservationId: string) => void;
  isLoading: boolean;
}

export const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [isLoading, setIsLoading] = useState(false);

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [...prev, reservation]);
  };

  const removeReservation = (reservationId: string) => {
    setReservations(prev => prev.filter(res => res.id !== reservationId));
  }

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, removeReservation, isLoading }}>
      {children}
    </ReservationsContext.Provider>
  );
};
