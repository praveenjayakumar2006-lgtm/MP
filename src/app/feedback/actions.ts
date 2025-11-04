'use server';

import fs from 'fs/promises';
import path from 'path';

type FeedbackData = [string, string, number, string];

export async function saveFeedbackToFile(data: FeedbackData) {
  const filePath = path.join(process.cwd(), 'User_Feedback.txt');
  const feedbackString = JSON.stringify(data) + '\n';

  try {
    await fs.appendFile(filePath, feedbackString, 'utf8');
    return { success: true, message: 'Feedback saved.' };
  } catch (error) {
    console.error('Error writing to feedback file:', error);
    return { success: false, message: 'Could not save feedback.' };
  }
}
