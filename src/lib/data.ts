
import type { ParkingSlot, Reservation } from './types';

export const parkingSlots: ParkingSlot[] = [
  // Car slots
  { id: 'C1', status: 'available', type: 'car' },
  { id: 'C2', status: 'occupied', type: 'car' },
  { id: 'C3', status: 'available', type: 'car' },
  { id: 'C4', status: 'occupied', type: 'car' },
  { id: 'C5', status: 'available', type: 'car' },
  // Bike slots
  { id: 'B1', status: 'available', type: 'bike' },
  { id: 'B2', status: 'available', type: 'bike' },
  { id: 'B3', status: 'reserved', type: 'bike' },
  { id: 'B4', status: 'available', type: 'bike' },
  { id: 'B5', status: 'occupied', type: 'bike' },
  { id: 'B6', status: 'available', type: 'bike' },
  { id: 'B7', status: 'available', type: 'bike' },
  { id: 'B8', status: 'available', type: 'bike' },
  { id: 'B9', status: 'available', type: 'bike' },
  { id: 'B10', status: 'available', type: 'bike' },
];


export const reservations: Reservation[] = [
  {
    id: 'RES-001',
    slotId: 'C2',
    vehiclePlate: 'XYZ-1234',
    startTime: new Date(new Date().getTime() - 2 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
    status: 'Active',
  },
  {
    id: 'RES-002',
    slotId: 'B3',
    vehiclePlate: 'ABC-5678',
    startTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000),
    status: 'Upcoming',
  },
    {
    id: 'RES-005',
    slotId: 'B5',
    vehiclePlate: 'DEF-5555',
    startTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() + (2 * 24 + 2) * 60 * 60 * 1000),
    status: 'Upcoming',
  },
  {
    id: 'RES-003',
    slotId: 'C1',
    vehiclePlate: 'QWE-9101',
    startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() - 22 * 60 * 60 * 1000),
    status: 'Completed',
  },
  {
    id: 'RES-004',
    slotId: 'B1',
    vehiclePlate: 'RTY-1121',
    startTime: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(new Date().getTime() - (2 * 24 - 1) * 60 * 60 * 1000),
    status: 'Completed',
  },
];
