'use server';

/**
 * @fileOverview A Genkit flow to define English words.
 * 
 * - defineWord - Fetches definition, IPA, examples, and type for a given word.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DefineWordInputSchema = z.object({
  word: z.string().describe('The English word to define.'),
});
export type DefineWordInput = z.infer<typeof DefineWordInputSchema>;

const DefineWordOutputSchema = z.object({
  word: z.string().describe('The word being defined.'),
  definition: z.string().describe('A clear, concise definition.'),
  ipa: z.string().optional().describe('The International Phonetic Alphabet transcription.'),
  examples: z.array(z.string()).describe('Natural-sounding example sentences.'),
  type: z.string().describe('The word type (e.g., noun, verb, adjective).'),
});
export type DefineWordOutput = z.infer<typeof DefineWordOutputSchema>;

export async function defineWord(input: DefineWordInput): Promise<DefineWordOutput> {
  return defineWordFlow(input);
}

const defineWordPrompt = ai.definePrompt({
  name: 'defineWordPrompt',
  input: { schema: DefineWordInputSchema },
  output: { schema: DefineWordOutputSchema },
  prompt: `You are an expert lexicographer and English teacher. 
  Provide accurate and helpful information for the word: "{{word}}".
  
  The definition should be easy to understand.
  The IPA should be standard (e.g., /əˈmeɪzɪŋ/).
  Provide at least 2 natural-sounding example sentences.
  Identify the most common grammatical type (noun, verb, etc.).`,
});

const defineWordFlow = ai.defineFlow(
  {
    name: 'defineWordFlow',
    inputSchema: DefineWordInputSchema,
    outputSchema: DefineWordOutputSchema,
  },
  async (input) => {
    const { output } = await defineWordPrompt(input);
    if (!output) throw new Error('AI failed to generate a definition.');
    return output;
  }
);
