'use server';

/**
 * @fileOverview Detects parking violations using AI analysis of parking slot data.
 *
 * - detectParkingViolation - A function to detect parking violations.
 * - DetectParkingViolationInput - The input type for the detectParkingViolation function.
 * - DetectParkingViolationOutput - The return type for the detectParkingViolation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectParkingViolationInputSchema = z.object({
  slotNumber: z.string().describe('The parking slot number.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking']).describe('The type of parking violation.'),
  timestamp: z.string().describe('The timestamp of the violation.'),
  details: z.string().describe('Additional details about the violation.'),
});
export type DetectParkingViolationInput = z.infer<typeof DetectParkingViolationInputSchema>;

const DetectParkingViolationOutputSchema = z.object({
  isViolationDetected: z.boolean().describe('Whether a parking violation is detected.'),
  violationDetails: z.string().describe('Details of the parking violation, if any.'),
});
export type DetectParkingViolationOutput = z.infer<typeof DetectParkingViolationOutputSchema>;

export async function detectParkingViolation(input: DetectParkingViolationInput): Promise<DetectParkingViolationOutput> {
  return detectParkingViolationFlow(input);
}

const detectParkingViolationPrompt = ai.definePrompt({
  name: 'detectParkingViolationPrompt',
  input: {schema: DetectParkingViolationInputSchema},
  output: {schema: DetectParkingViolationOutputSchema},
  prompt: `You are an AI assistant that analyzes parking slot data to detect violations.

  Analyze the following parking violation data:
  Slot Number: {{{slotNumber}}}
  Violation Type: {{{violationType}}}
  Timestamp: {{{timestamp}}}
  Details: {{{details}}}

  Determine if a violation has occurred based on the provided data. Provide a detailed analysis in violationDetails. If no violation return an empty string in the violationDetails field.
  Return isViolationDetected as true is a violation has occurred and false otherwise.
`,
});

const detectParkingViolationFlow = ai.defineFlow(
  {
    name: 'detectParkingViolationFlow',
    inputSchema: DetectParkingViolationInputSchema,
    outputSchema: DetectParkingViolationOutputSchema,
  },
  async input => {
    const {output} = await detectParkingViolationPrompt(input);
    return output!;
  }
);
