'use server';

/**
 * @fileOverview A Genkit flow to identify multiple senses/types of English words.
 * 
 * - defineWord - Identifies the various parts of speech and meanings for a given word.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DefineWordInputSchema = z.object({
  word: z.string().describe('The English word to define.'),
});
export type DefineWordInput = z.infer<typeof DefineWordInputSchema>;

const WordSenseSchema = z.object({
  type: z.string().describe('The grammatical category (noun, verb, adjective, etc.).'),
  definition: z.string().describe('A clear, concise definition for this specific sense.'),
  ipa: z.string().optional().describe('Standard IPA transcription.'),
  examples: z.array(z.string()).describe('Natural example sentences for this sense.'),
});

const DefineWordOutputSchema = z.object({
  word: z.string().describe('The word being defined.'),
  senses: z.array(WordSenseSchema).describe('A list of common parts of speech and meanings for the word.'),
});
export type DefineWordOutput = z.infer<typeof DefineWordOutputSchema>;

export async function defineWord(input: DefineWordInput): Promise<DefineWordOutput> {
  return defineWordFlow(input);
}

const defineWordPrompt = ai.definePrompt({
  name: 'defineWordPrompt',
  input: { schema: DefineWordInputSchema },
  output: { schema: DefineWordOutputSchema },
  prompt: `You are an expert lexicographer. 
  For the word: "{{word}}", identify its most common grammatical senses (e.g., noun, verb, adjective).
  
  For each sense, provide:
  1. The type (noun, verb, etc.).
  2. A clear, concise definition.
  3. The standard IPA (e.g., /əˈmeɪzɪŋ/).
  4. At least 2 natural-sounding example sentences.
  
  Include all distinct and common parts of speech for the word.`,
});

const defineWordFlow = ai.defineFlow(
  {
    name: 'defineWordFlow',
    inputSchema: DefineWordInputSchema,
    outputSchema: DefineWordOutputSchema,
  },
  async (input) => {
    const { output } = await defineWordPrompt(input);
    if (!output) throw new Error('AI failed to generate word senses.');
    return output;
  }
);
