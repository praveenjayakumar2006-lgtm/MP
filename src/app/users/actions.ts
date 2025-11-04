
'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type UserData = {
  id: string;
  name: string;
  email: string;
};

// Use the temporary directory for reliable writing
const usersFilePath = path.join(os.tmpdir(), 'User_Data.json');

async function readUsersFromFile(): Promise<UserData[]> {
    try {
        await fs.access(usersFilePath);
        const fileContent = await fs.readFile(usersFilePath, 'utf8');
        return JSON.parse(fileContent) as UserData[];
    } catch (error) {
        // If the file doesn't exist or is invalid JSON, return an empty array.
        return [];
    }
}

export async function saveUserToFile(data: UserData) {
  const existingUsers = await readUsersFromFile();
  
  // Avoid duplicate users
  if (existingUsers.some(user => user.id === data.id)) {
    return { success: true, message: 'User already exists.' };
  }

  existingUsers.unshift(data);

  try {
    await fs.writeFile(usersFilePath, JSON.stringify(existingUsers, null, 2), 'utf8');
    return { success: true, message: 'User saved.' };
  } catch (error) {
    console.error('Error writing to users file:', error);
    return { success: false, message: 'Could not save user.' };
  }
}

export async function getUsersFromFile() {
    try {
        const data = await readUsersFromFile();
        return { success: true, data };
    } catch (error) {
        console.error('Error reading users file:', error);
        return { success: false, message: 'Could not read users.' };
    }
}
