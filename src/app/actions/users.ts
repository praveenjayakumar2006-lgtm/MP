
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { User } from '@/lib/types';

// Use a permanent location within the project
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'User_Data.json');

async function ensureDirectoryExists() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

async function readUsersFile(): Promise<User[]> {
  try {
    await fs.access(usersFilePath);
    const fileContent = await fs.readFile(usersFilePath, 'utf-8');
    if (!fileContent) {
        return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function writeUsersFile(data: User[]): Promise<void> {
  await ensureDirectoryExists();
  await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
}

export async function getUsers(): Promise<User[]> {
    return await readUsersFile();
}

export async function saveUserToFile(user: User): Promise<void> {
  const users = await readUsersFile();
  const existingUser = users.find(u => u.id === user.id || u.email === user.email);
  if (!existingUser) {
    users.push(user);
    await writeUsersFile(users);
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
    let allUsers = await readUsersFile();
    const initialLength = allUsers.length;
    allUsers = allUsers.filter(u => u.id !== userId);

    if (allUsers.length < initialLength) {
        await writeUsersFile(allUsers);
        return { success: true };
    } else {
        return { success: false };
    }
}
