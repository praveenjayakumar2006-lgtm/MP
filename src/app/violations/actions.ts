
'use server';

import {
  detectParkingViolation,
  type DetectParkingViolationInput,
} from '@/ai/flows/detect-parking-violations';
import {
  extractVehicleInfo,
  type ExtractVehicleInfoInput,
} from '@/ai/flows/extract-vehicle-info';

export async function analyzeViolation(input: DetectParkingViolationInput) {
  const result = await detectParkingViolation(input);
  return result;
}

export async function analyzeVehicleImage(input: ExtractVehicleInfoInput) {
  const result = await extractVehicleInfo(input);
  return result;
}
