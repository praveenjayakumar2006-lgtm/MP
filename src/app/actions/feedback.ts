
'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type Feedback = {
  id: string;
  name: string;
  email: string;
  rating: number;
  feedback: string;
  createdAt: string;
};

const feedbackFilePath = path.join(os.tmpdir(), 'User_Feedback.json');

async function readFeedbackFile(): Promise<Feedback[]> {
  try {
    await fs.access(feedbackFilePath);
    const fileContent = await fs.readFile(feedbackFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    return [];
  }
}

async function writeFeedbackFile(data: Feedback[]): Promise<void> {
  await fs.writeFile(feedbackFilePath, JSON.stringify(data, null, 2));
}

export async function getFeedback(): Promise<Feedback[]> {
  return await readFeedbackFile();
}

export async function saveFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
  const allFeedback = await readFeedbackFile();
  const newFeedback: Feedback = {
    ...feedback,
    id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  allFeedback.push(newFeedback);
  await writeFeedbackFile(allFeedback);
  return newFeedback;
}
