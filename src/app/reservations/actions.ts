
'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { Reservation } from '@/lib/types';

// Use the temporary directory for reliable writing
const reservationsFilePath = path.join(os.tmpdir(), 'User_Reservations.json');

type StoredReservation = Omit<Reservation, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'> & {
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};


async function readReservationsFromFile(): Promise<StoredReservation[]> {
    try {
        await fs.access(reservationsFilePath);
        const fileContent = await fs.readFile(reservationsFilePath, 'utf8');
        if (!fileContent) return [];
        return JSON.parse(fileContent) as StoredReservation[];
    } catch (error) {
        // If the file doesn't exist or is invalid JSON, return an empty array.
        return [];
    }
}

export async function saveReservationToFile(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { userId: string }) {
  const existingReservations = await readReservationsFromFile();
  
  const newReservation: StoredReservation = {
    ...data,
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    status: 'Upcoming',
    startTime: data.startTime.toISOString(),
    endTime: data.endTime.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  existingReservations.unshift(newReservation);

  try {
    await fs.writeFile(reservationsFilePath, JSON.stringify(existingReservations, null, 2), 'utf8');
    return { success: true, message: 'Reservation saved.' };
  } catch (error) {
    console.error('Error writing to reservations file:', error);
    return { success: false, message: 'Could not save reservation.' };
  }
}

export async function getReservationsFromFile() {
    try {
        const data = await readReservationsFromFile();
        const reservations: Reservation[] = data.map(r => ({
            ...r,
            startTime: new Date(r.startTime),
            endTime: new Date(r.endTime),
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
        }));
        return { success: true, data: reservations };
    } catch (error) {
        console.error('Error reading reservations file:', error);
        return { success: false, message: 'Could not read reservations.' };
    }
}

export async function deleteReservationFromFile(reservationId: string) {
    const existingReservations = await readReservationsFromFile();
    const filteredReservations = existingReservations.filter(res => res.id !== reservationId);

    try {
        await fs.writeFile(reservationsFilePath, JSON.stringify(filteredReservations, null, 2), 'utf8');
        return { success: true, message: 'Reservation deleted.' };
    } catch (error) {
        console.error('Error writing to reservations file after deletion:', error);
        return { success: false, message: 'Could not delete reservation.' };
    }
}
