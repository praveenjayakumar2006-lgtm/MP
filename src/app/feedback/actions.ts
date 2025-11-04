
'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type FeedbackData = {
  name: string;
  email: string;
  rating: number;
  feedback: string;
  createdAt: string; 
};

// Use the temporary directory for reliable writing
const feedbackFilePath = path.join(os.tmpdir(), 'User_Feedback.json');

async function readFeedbackFromFile(): Promise<FeedbackData[]> {
    try {
        await fs.access(feedbackFilePath);
        const fileContent = await fs.readFile(feedbackFilePath, 'utf8');
        return JSON.parse(fileContent) as FeedbackData[];
    } catch (error) {
        // If the file doesn't exist or is invalid JSON, return an empty array.
        return [];
    }
}

export async function saveFeedbackToFile(data: Omit<FeedbackData, 'createdAt'>) {
  const existingFeedback = await readFeedbackFromFile();
  const newFeedback: FeedbackData = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  
  existingFeedback.unshift(newFeedback); // Add new feedback to the top

  try {
    await fs.writeFile(feedbackFilePath, JSON.stringify(existingFeedback, null, 2), 'utf8');
    return { success: true, message: 'Feedback saved.' };
  } catch (error) {
    console.error('Error writing to feedback file:', error);
    return { success: false, message: 'Could not save feedback.' };
  }
}

export async function getFeedback() {
    const data = await readFeedbackFromFile();
    return { success: true, data };
}
