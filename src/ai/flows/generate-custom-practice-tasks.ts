'use server';

/**
 * @fileOverview Generates custom practice tasks based on user goals and journal analysis.
 *
 * - generateCustomPracticeTasks - A function that generates practice tasks.
 * - GenerateCustomPracticeTasksInput - The input type for the generateCustomPracticeTasks function.
 * - GenerateCustomPracticeTasksOutput - The return type for the generateCustomPracticeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCustomPracticeTasksInputSchema = z.object({
  userGoals: z
    .string()
    .describe('The user-defined goals for their practice sessions.'),
  journalAnalysis: z
    .string()
    .describe(
      'The AI-analyzed insights from the user\u2019s previous journal entries, highlighting patterns, strengths, and weaknesses.'
    ),
  skill: z.string().describe('The specific skill the user is practicing.'),
  proficiencyLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The user-defined proficiency level.'),
});
export type GenerateCustomPracticeTasksInput = z.infer<
  typeof GenerateCustomPracticeTasksInputSchema
>;

const GenerateCustomPracticeTasksOutputSchema = z.object({
  practiceTasks: z
    .array(z.string())
    .describe('A list of custom practice tasks tailored to the user\u2019s goals, journal analysis, skill, and proficiency level.'),
});
export type GenerateCustomPracticeTasksOutput = z.infer<
  typeof GenerateCustomPracticeTasksOutputSchema
>;

export async function generateCustomPracticeTasks(
  input: GenerateCustomPracticeTasksInput
): Promise<GenerateCustomPracticeTasksOutput> {
  return generateCustomPracticeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCustomPracticeTasksPrompt',
  input: {
    schema: GenerateCustomPracticeTasksInputSchema,
  },
  output: {schema: GenerateCustomPracticeTasksOutputSchema},
  prompt: `You are an AI practice task generator. You will generate custom practice tasks based on the user's goals, journal analysis, skill, and proficiency level.

Skill: {{{skill}}}
Proficiency Level: {{{proficiencyLevel}}}
User Goals: {{{userGoals}}}
Journal Analysis: {{{journalAnalysis}}}

Generate a list of practice tasks that will help the user improve their skills. The tasks should be specific, measurable, achievable, relevant, and time-bound (SMART).

Tasks:`,
});

const generateCustomPracticeTasksFlow = ai.defineFlow(
  {
    name: 'generateCustomPracticeTasksFlow',
    inputSchema: GenerateCustomPracticeTasksInputSchema,
    outputSchema: GenerateCustomPracticeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
