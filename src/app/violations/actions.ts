'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type ViolationData = {
  slotNumber: string;
  violationType: string;
  licensePlate: string;
  imageUrl?: string | null;
  userId: string;
  createdAt: string;
};

// Use the temporary directory for reliable writing
const violationsFilePath = path.join(os.tmpdir(), 'User_Violations.json');

async function readViolationsFromFile(): Promise<ViolationData[]> {
    try {
        await fs.access(violationsFilePath);
        const fileContent = await fs.readFile(violationsFilePath, 'utf8');
        return JSON.parse(fileContent) as ViolationData[];
    } catch (error) {
        // If the file doesn't exist or is invalid JSON, return an empty array.
        return [];
    }
}

export async function saveViolationToFile(data: Omit<ViolationData, 'createdAt'>) {
  const existingViolations = await readViolationsFromFile();
  const newViolation: ViolationData = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  
  existingViolations.unshift(newViolation); // Add new violation to the top

  try {
    await fs.writeFile(violationsFilePath, JSON.stringify(existingViolations, null, 2), 'utf8');
    return { success: true, message: 'Violation saved.' };
  } catch (error) {
    console.error('Error writing to violations file:', error);
    return { success: false, message: 'Could not save violation.' };
  }
}

export async function getViolations() {
    const data = await readViolationsFromFile();
    return { success: true, data };
}