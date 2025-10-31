'use server';

/**
 * @fileOverview Generates a suggestion for a user's next goal.
 *
 * - generateNextGoal - A function that generates a goal suggestion.
 */

import {ai} from '@/ai/genkit';
import { GenerateNextGoalInputSchema, GenerateNextGoalOutputSchema, type GenerateNextGoalInput, type GenerateNextGoalOutput } from './generate-next-goal.types';


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
