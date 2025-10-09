
import type { ParkingSlot, Reservation } from './types';

export const parkingSlots: ParkingSlot[] = Array.from({ length: 24 }, (_, i) => {
  const slotNumber = i + 1;
  let status: ParkingSlot['status'] = 'available';
  if (slotNumber % 4 === 0) {
    status = 'occupied';
  } else if (slotNumber % 7 === 0) {
    status = 'reserved';
  }
  return {
    id: `A${slotNumber}`,
    status,
  };
});

export const reservations: Reservation[] = [
  {
    id: 'RES-001',
    slotId: 'A7',
    vehiclePlate: 'XYZ-1234',
    startTime: new Date(new Date().getTime() - 2 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
    status: 'Active',
  },
  {
    id: 'RES-002',
    slotId: 'B12',
    vehiclePlate: 'ABC-5678',
    startTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000),
    status: 'Upcoming',
  },
  {
    id: 'RES-003',
    slotId: 'C3',
    vehiclePlate: 'QWE-9101',
    startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() - 22 * 60 * 60 * 1000),
    status: 'Completed',
  },
  {
    id: 'RES-004',
    slotId: 'A21',
    vehiclePlate: 'RTY-1121',
    startTime: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() - (2 * 24 - 1) * 60 * 60 * 1000),
    status: 'Completed',
  },
];
