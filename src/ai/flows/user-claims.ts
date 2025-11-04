'use server';
/**
 * @fileOverview A Genkit flow for managing user claims.
 *
 * This file defines a flow and a tool for setting custom claims on a Firebase
 * Authentication user. This is used to grant administrative or special roles,
 * such as 'owner'.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
  );
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Define the schema for the tool input
const SetCustomClaimsInputSchema = z.object({
  uid: z.string().describe('The UID of the user to set claims for.'),
  claims: z.record(z.any()).describe('The custom claims to set.'),
});

/**
 * A Genkit tool to set custom claims for a Firebase user.
 * This should only be callable by authorized personnel.
 */
const setCustomClaims = ai.defineTool(
  {
    name: 'setCustomClaims',
    description: 'Sets custom claims for a Firebase user.',
    inputSchema: SetCustomClaimsInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ uid, claims }) => {
    try {
      await getAuth().setCustomUserClaims(uid, claims);
      return {
        success: true,
        message: `Successfully set custom claims for user ${uid}.`,
      };
    } catch (error: any) {
      console.error('Error setting custom claims:', error);
      return {
        success: false,
        message: error.message || 'An unknown error occurred.',
      };
    }
  }
);

// Define the schema for the flow input
export const SetUserClaimsInputSchema = z.object({
  uid: z.string().describe('The UID of the user.'),
  role: z.string().describe("The role to assign (e.g., 'owner')."),
});
export type SetUserClaimsInput = z.infer<typeof SetUserClaimsInputSchema>;

/**
 * A Genkit flow that sets a specific role claim for a user.
 * It uses the `setCustomClaims` tool to perform the action.
 */
export const setUserClaimsFlow = ai.defineFlow(
  {
    name: 'setUserClaimsFlow',
    inputSchema: SetUserClaimsInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    // This flow is a simple wrapper around the tool.
    // In a real app, you might have more logic here, like checking
    // if the caller has permission to set claims.
    const result = await setCustomClaims({
      uid: input.uid,
      claims: { [input.role]: true },
    });
    return result;
  }
);

/**
 * Wrapper function to be called from the server-side component.
 * @param input - The user ID and role to set.
 * @returns The result of the flow operation.
 */
export async function setUserClaims(
  input: SetUserClaimsInput
): Promise<{ success: boolean; message: string }> {
  return await setUserClaimsFlow(input);
}
