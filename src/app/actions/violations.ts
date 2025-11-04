
'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type Violation = {
  id: string;
  slotNumber: string;
  violationType: string;
  licensePlate: string;
  imageUrl?: string | null;
  userId: string;
  createdAt: string;
};


const violationsFilePath = path.join(os.tmpdir(), 'User_Violations.json');

async function readViolationsFile(): Promise<Violation[]> {
  try {
    await fs.access(violationsFilePath);
    const fileContent = await fs.readFile(violationsFilePath, 'utf-8');
    if (!fileContent) {
        return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function writeViolationsFile(data: Violation[]): Promise<void> {
  await fs.writeFile(violationsFilePath, JSON.stringify(data, null, 2));
}

export async function getViolations(): Promise<Violation[]> {
    return await readViolationsFile();
}

export async function saveViolation(violation: Omit<Violation, 'id' | 'createdAt'>): Promise<Violation> {
  const allViolations = await readViolationsFile();
  const newViolation: Violation = {
    ...violation,
    id: `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  allViolations.push(newViolation);
  await writeViolationsFile(allViolations);
  return newViolation;
}
