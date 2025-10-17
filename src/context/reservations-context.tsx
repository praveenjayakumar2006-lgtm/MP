
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Reservation } from '@/lib/types';

const today = new Date();
const startTime = new Date(today);
startTime.setMinutes(startTime.getMinutes() - 25);

const endTime = new Date(today);
endTime.setHours(endTime.getHours() + 2);
endTime.setMinutes(endTime.getMinutes() + 35);

const mockReservations: Reservation[] = [
    {
        id: '1',
        slotId: 'C2',
        userId: 'user-123',
        vehiclePlate: 'USER-195',
        startTime: startTime,
        endTime: endTime,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '4',
        slotId: 'B1',
        userId: 'user-123',
        vehiclePlate: 'USER-911',
        startTime: new Date('2024-07-20T14:00:00'),
        endTime: new Date('2024-07-20T15:00:00'),
        status: 'Completed',
        createdAt: new Date('2024-07-20T13:00:00'),
        updatedAt: new Date('2024-07-20T13:00:00'),
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
