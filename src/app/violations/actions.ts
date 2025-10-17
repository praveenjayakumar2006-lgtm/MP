
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

export async function analyzeViolationText(
    violationInput: DetectParkingViolationInput
): Promise<DetectParkingViolationOutput> {
  return await detectParkingViolation(violationInput);
}

export async function analyzeVehicleImage(
    imageInput: ExtractVehicleInfoInput
): Promise<ExtractVehicleInfoOutput> {
    return await extractVehicleInfo(imageInput);
}

