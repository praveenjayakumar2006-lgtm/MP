
'use server';

import fs from 'fs/promises';
import path from 'path';

type FeedbackData = [string, string, number, string];

export async function saveFeedbackToFile(data: FeedbackData) {
  const filePath = path.join(process.cwd(), 'User_Feedback.txt');
  // Format the data as a string representation of a JSON array, followed by a newline
  const feedbackString = JSON.stringify(data) + '\n';

  try {
    await fs.appendFile(filePath, feedbackString, 'utf8');
    return { success: true, message: 'Feedback saved.' };
  } catch (error) {
    console.error('Error writing to feedback file:', error);
    return { success: false, message: 'Could not save feedback.' };
  }
}

export async function readFeedbackFromFile() {
    const filePath = path.join(process.cwd(), 'User_Feedback.txt');
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.trim().split('\n');
        const feedbackList = lines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(item => item !== null);
        return { success: true, data: feedbackList as FeedbackData[] };
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, which is fine, just return empty array
            return { success: true, data: [] };
        }
        console.error('Error reading feedback file:', error);
        return { success: false, message: 'Could not read feedback.' };
    }
}
