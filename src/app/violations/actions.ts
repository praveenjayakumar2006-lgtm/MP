
'use server';

import {
  detectParkingViolation,
  type DetectParkingViolationInput,
  type DetectParkingViolationOutput,
} from '@/ai/flows/detect-parking-violations';
import {
  extractVehicleInfo,
  type ExtractVehicleInfoInput,
  type ExtractVehicleInfoOutput,
} from '@/ai/flows/extract-vehicle-info';

export type CombinedAnalysisResult = {
    violationResult: DetectParkingViolationOutput;
    vehicleResult: ExtractVehicleInfoOutput;
}

export async function analyzeCombinedViolation(
    violationInput: DetectParkingViolationInput,
    imageInput: ExtractVehicleInfoInput
): Promise<CombinedAnalysisResult> {
  const [violationResult, vehicleResult] = await Promise.all([
    detectParkingViolation(violationInput),
    extractVehicleInfo(imageInput),
  ]);
  return { violationResult, vehicleResult };
}
