'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type Reservation = {
    id: string;
    userId: string;
    slotId: string;
    vehiclePlate: string;
    startTime: string;
    endTime: string;
    status: 'Upcoming' | 'Active' | 'Completed';
    createdAt: string;
};

const reservationsFilePath = path.join(os.tmpdir(), 'User_Reservations.json');

async function readReservationsFile(): Promise<Reservation[]> {
  try {
    await fs.access(reservationsFilePath);
    const fileContent = await fs.readFile(reservationsFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function writeReservationsFile(data: Reservation[]): Promise<void> {
  await fs.writeFile(reservationsFilePath, JSON.stringify(data, null, 2));
}

export async function getReservations(): Promise<Reservation[]> {
  const reservations = await readReservationsFile();
  const now = new Date();
  
  return reservations.map(res => {
    const startTime = new Date(res.startTime);
    const endTime = new Date(res.endTime);
    let status: 'Upcoming' | 'Active' | 'Completed';

    if (now > endTime) {
      status = 'Completed';
    } else if (now >= startTime && now < endTime) {
      status = 'Active';
    } else {
      status = 'Upcoming';
    }
    return { ...res, status };
  });
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
