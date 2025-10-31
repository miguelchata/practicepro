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

const nextGoalSchema = z.object({
  goal: z.string().min(3, 'Goal must be at least 3 characters.'),
  outcome: z.string().min(3, 'Outcome is required.'),
});

type NextGoalFormProps = {
  onGoalAdded: (goals: (Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId' | 'status'> & { skillArea: string })[]) => void;
  skillArea: string;
  level?: GoalLevel;
};

export function NextGoalForm({ onGoalAdded, skillArea, level }: NextGoalFormProps) {
  const form = useForm<z.infer<typeof nextGoalSchema>>({
    resolver: zodResolver(nextGoalSchema),
    defaultValues: {
      goal: '',
      outcome: '',
    },
  });

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
                <Input
                    placeholder="e.g., 'Play it smoothly at 100 BPM'"
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding Goal...' : 'Add Next Goal'}
        </Button>
      </form>
    </Form>
  );
}
