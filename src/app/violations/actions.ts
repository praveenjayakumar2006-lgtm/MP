
'use server';

import {
  detectParkingViolation,
  type DetectParkingViolationInput,
} from '@/ai/flows/detect-parking-violations';

export async function analyzeViolation(input: DetectParkingViolationInput) {
  const result = await detectParkingViolation(input);
  return result;
}
