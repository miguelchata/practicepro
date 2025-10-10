'use server';

/**
 * @fileOverview Analyzes session journal entries using NLP to identify patterns and insights.
 *
 * - analyzeSessionJournalEntries - A function that handles the analysis of session journal entries.
 * - AnalyzeSessionJournalEntriesInput - The input type for the analyzeSessionJournalEntries function.
 * - AnalyzeSessionJournalEntriesOutput - The return type for the analyzeSessionJournalEntries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSessionJournalEntriesInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The journal entry from a practice session to be analyzed.'),
  userGoals: z
    .string()
    .describe('The user goals associated with the practice session.'),
});
export type AnalyzeSessionJournalEntriesInput = z.infer<
  typeof AnalyzeSessionJournalEntriesInputSchema
>;

const AnalyzeSessionJournalEntriesOutputSchema = z.object({
  patterns: z
    .string()
    .describe('Identified patterns and insights from the journal entry.'),
  suggestions: z
    .string()
    .describe('AI-generated suggestions based on the analysis.'),
});
export type AnalyzeSessionJournalEntriesOutput = z.infer<
  typeof AnalyzeSessionJournalEntriesOutputSchema
>;

export async function analyzeSessionJournalEntries(
  input: AnalyzeSessionJournalEntriesInput
): Promise<AnalyzeSessionJournalEntriesOutput> {
  return analyzeSessionJournalEntriesFlow(input);
}

const analyzeSessionJournalEntriesPrompt = ai.definePrompt({
  name: 'analyzeSessionJournalEntriesPrompt',
  input: {schema: AnalyzeSessionJournalEntriesInputSchema},
  output: {schema: AnalyzeSessionJournalEntriesOutputSchema},
  prompt: `You are an AI assistant that analyzes user journal entries from practice sessions to identify patterns and insights, and provides personalized suggestions for improvement.

  Analyze the following journal entry in relation to the user's goals:

  User Goals: {{{userGoals}}}

  Journal Entry: {{{journalEntry}}}

  Identify patterns in the user's performance, challenges, and feelings during the session. Provide specific, actionable suggestions based on your analysis. Focus on areas where the user can improve their practice and achieve their goals.
  Patterns:
  Suggestions:`,
});

const analyzeSessionJournalEntriesFlow = ai.defineFlow(
  {
    name: 'analyzeSessionJournalEntriesFlow',
    inputSchema: AnalyzeSessionJournalEntriesInputSchema,
    outputSchema: AnalyzeSessionJournalEntriesOutputSchema,
  },
  async input => {
    const {output} = await analyzeSessionJournalEntriesPrompt(input);
    return output!;
  }
);
