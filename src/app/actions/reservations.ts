
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

type Reservation = {
    id: string;
    userId: string;
    userName: string;
    email: string;
    slotId: string;
    vehiclePlate: string;
    startTime: string;
    endTime: string;
    status: 'Upcoming' | 'Active' | 'Completed';
    createdAt: string;
};

const dataDir = path.join(process.cwd(), 'data');
const reservationsFilePath = path.join(dataDir, 'User_Reservations.json');

async function readReservationsFile(): Promise<Reservation[]> {
  try {
    await fs.access(reservationsFilePath);
    const fileContent = await fs.readFile(reservationsFilePath, 'utf-8');
    // If file is empty, parsing will fail, so we return an empty array.
    return fileContent ? JSON.parse(fileContent) : [];
  } catch (error) {
    // If file doesn't exist or another error occurs, return an empty array.
    return [];
  }
}

async function writeReservationsFile(data: Reservation[]): Promise<void> {
    // Critical safety check: Ensure the file path is correct before writing.
    if (!reservationsFilePath.endsWith('User_Reservations.json')) {
        console.error(`CRITICAL: Aborting write operation due to incorrect file path: ${reservationsFilePath}`);
        return;
    }
    await fs.writeFile(reservationsFilePath, JSON.stringify(data, null, 2));
    
    // Revalidate paths to ensure UI updates across the app
    revalidatePath('/owner');
    revalidatePath('/reservations');
    revalidatePath('/select-spot');
    revalidatePath('/');
}

export async function getReservations(): Promise<Reservation[]> {
  const reservations = await readReservationsFile();
  const now = new Date();
  
  if (!reservations) return [];

  let hasChanges = false;
  const updatedReservations = reservations.map(res => {
    const startTime = new Date(res.startTime);
    const endTime = new Date(res.endTime);
    const currentStatus = res.status;
    let newStatus: 'Upcoming' | 'Active' | 'Completed';

    if (now > endTime) {
      newStatus = 'Completed';
    } else if (now >= startTime && now <= endTime) {
      newStatus = 'Active';
    } else {
      newStatus = 'Upcoming';
    }
    
    if (newStatus !== currentStatus) {
      hasChanges = true;
    }

    return { ...res, status: newStatus };
  });
  
  if (hasChanges) {
    await writeReservationsFile(updatedReservations);
  }

  return updatedReservations;
}

export async function saveReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Promise<Reservation> {
  const allReservations = await readReservationsFile();
  const newReservation: Reservation = {
    ...reservation,
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'Upcoming',
  };
  allReservations.push(newReservation);
  await writeReservationsFile(allReservations);
  return newReservation;
}

export async function deleteReservation(reservationId: string): Promise<{ success: boolean }> {
    let allReservations = await readReservationsFile();
    const initialLength = allReservations.length;
    allReservations = allReservations.filter(res => res.id !== reservationId);

    if (allReservations.length < initialLength) {
        await writeReservationsFile(allReservations);
        return { success: true };
    } else {
        return { success: false };
    }
}
