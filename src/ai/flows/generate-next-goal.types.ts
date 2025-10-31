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
