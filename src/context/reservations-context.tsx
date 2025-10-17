
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
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
    },
    {
        id: '3',
        slotId: 'C1',
        userId: 'user-123',
        vehiclePlate: 'USER-482',
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T12:00:00'),
        status: 'Upcoming',
        createdAt: new Date('2025-01-15T09:00:00'),
        updatedAt: new Date('2025-01-15T09:00:00'),
    },
    {
        id: '4',
        slotId: 'B1',
        userId: 'user-123',
        vehiclePlate: 'USER-911',
        startTime: new Date('2025-01-20T14:00:00'),
        endTime: new Date('2025-01-20T15:00:00'),
        status: 'Upcoming',
        createdAt: new Date('2025-01-20T13:00:00'),
        updatedAt: new Date('2025-01-20T13:00:00'),
    }
];

interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  removeReservation: (reservationId: string) => void;
  isLoading: boolean;
  isClient: boolean;
}

export const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [...prev, reservation]);
  };

  const removeReservation = (reservationId: string) => {
    setReservations(prev => prev.filter(res => res.id !== reservationId));
  }

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, removeReservation, isLoading, isClient }}>
      {children}
    </ReservationsContext.Provider>
  );
};
