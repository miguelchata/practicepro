'use server';

/**
 * @fileOverview Generates a suggestion for a user's next goal.
 *
 * - generateNextGoal - A function that generates a goal suggestion.
 * - GenerateNextGoalInput - The input type for the function.
 * - GenerateNextGoalOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateNextGoalInputSchema = z.object({
    skillArea: z.string().describe("The broader skill area the user is working on (e.g., 'React Hooks', 'Fingerpicking')."),
    level: z.string().describe("The user's current proficiency level (e.g., 'Junior', 'Intermediate')."),
    previousGoalTitle: z.string().describe("The title of the goal the user just completed."),
    previousGoalFeedback: z.string().describe("The user's self-provided feedback on their performance for the completed goal."),
});
export type GenerateNextGoalInput = z.infer<typeof GenerateNextGoalInputSchema>;

export const GenerateNextGoalOutputSchema = z.object({
  suggestedGoalTitle: z.string().describe("A concise, clear title for the suggested next goal."),
  suggestedGoalOutcome: z.string().describe("A specific, measurable outcome for the suggested next goal."),
});
export type GenerateNextGoalOutput = z.infer<typeof GenerateNextGoalOutputSchema>;

export async function generateNextGoal(input: GenerateNextGoalInput): Promise<GenerateNextGoalOutput> {
  return generateNextGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextGoalPrompt',
  input: {
    schema: GenerateNextGoalInputSchema,
  },
  output: {schema: GenerateNextGoalOutputSchema},
  prompt: `You are an expert coach who helps users with deliberate practice. Your task is to suggest the next logical practice goal based on a user's completed goal and their feedback.

The user is working on the skill area: {{{skillArea}}}
Their current level is: {{{level}}}

They just completed the goal: "{{{previousGoalTitle}}}"
Their feedback on it was: "{{{previousGoalFeedback}}}"

Based on this, suggest a single, new, specific goal that builds logically on the previous one. The new goal should be slightly more challenging but achievable. Provide a title and a measurable outcome for this new goal.
`,
});

const generateNextGoalFlow = ai.defineFlow(
  {
    name: 'generateNextGoalFlow',
    inputSchema: GenerateNextGoalInputSchema,
    outputSchema: GenerateNextGoalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
