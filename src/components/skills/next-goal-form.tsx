'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Goal, GoalLevel } from '@/lib/types';
import { Input } from '../ui/input';
import { useEffect } from 'react';
import type { GenerateNextGoalOutput } from '@/ai/flows/generate-next-goal';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';

const nextGoalSchema = z.object({
  goal: z.string().min(3, 'Goal must be at least 3 characters.'),
  outcome: z.string().min(3, 'Outcome is required.'),
});

type NextGoalFormProps = {
  onGoalAdded: (goals: (Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId' | 'status'> & { skillArea: string })[]) => void;
  skillArea: string;
  level?: GoalLevel;
  suggestion: GenerateNextGoalOutput | null;
  isLoadingSuggestion: boolean;
  previousFeedback?: string;
};

export function NextGoalForm({ onGoalAdded, skillArea, level, suggestion, isLoadingSuggestion, previousFeedback }: NextGoalFormProps) {
  const form = useForm<z.infer<typeof nextGoalSchema>>({
    resolver: zodResolver(nextGoalSchema),
    defaultValues: {
      goal: '',
      outcome: '',
    },
  });
  
  useEffect(() => {
    if (suggestion) {
        form.setValue('goal', suggestion.suggestedGoalTitle);
        form.setValue('outcome', suggestion.suggestedGoalOutcome);
    }
  }, [suggestion, form]);


  function onSubmit(values: z.infer<typeof nextGoalSchema>) {
    const newGoal = {
        skillArea: skillArea,
        title: values.goal,
        specific: values.goal,
        measurable: values.outcome,
        level: level,
    };
    onGoalAdded([newGoal]);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        
        {isLoadingSuggestion && (
            <div className="space-y-4 rounded-lg border border-dashed border-primary/50 bg-primary/10 p-4">
                <div className="flex items-center gap-2 font-medium text-primary">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <p>Generating suggestion...</p>
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        )}

        {suggestion && !isLoadingSuggestion && (
             <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                <div className="flex items-center gap-2 font-medium text-primary mb-2">
                    <Sparkles className="h-4 w-4" />
                    <p>AI Suggestion</p>
                </div>
                <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-primary/90">New Goal</FormLabel>
                        <FormControl>
                        <Input
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="outcome"
                    render={({ field }) => (
                    <FormItem className="mt-2">
                        <FormLabel className="text-primary/90">Measurable Outcome</FormLabel>
                        <FormControl>
                        <Textarea
                            rows={3}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        )}

        {!suggestion && !isLoadingSuggestion && (
          <>
            <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>New Goal</FormLabel>
                    <FormControl>
                    <Input
                        placeholder="e.g., 'Learn a new fingerpicking pattern'"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Measurable Outcome</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="e.g., 'Play it smoothly at 100 BPM without errors for 3 consecutive attempts.'"
                        rows={3}
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding Goal...' : 'Add Next Goal'}
        </Button>
      </form>
    </Form>
  );
}
