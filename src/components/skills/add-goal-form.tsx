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
import { Textarea } from '@/components/ui/textarea';
import type { Goal } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';

const formSchema = z.object({
  skillArea: z.string().min(1, { message: 'Please select a skill area.' }),
  specific: z.string().min(3, {
    message: 'Specific goal description must be at least 3 characters.',
  }),
  measurable: z.string().min(3, {
    message: 'Provide at least one measurable outcome, one per line.',
  }),
  deadline: z.date().optional(),
});

type AddGoalFormProps = {
  onGoalAdded: (skillArea: string, newGoal: Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId'>) => void;
  skillAreas: string[];
};

export function AddGoalForm({ onGoalAdded, skillAreas }: AddGoalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillArea: skillAreas[0] || '',
      specific: '',
      measurable: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newGoal: Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId'> = {
        title: values.specific,
        specific: values.specific,
        measurable: values.measurable.split('\n').filter(m => m.trim() !== ''),
        status: 'Not Started',
        deadline: values.deadline?.toISOString(),
    };
    onGoalAdded(values.skillArea, newGoal);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
            control={form.control}
            name="skillArea"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Skill Area</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a skill area to target" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {skillAreas.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
            control={form.control}
            name="specific"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Goal</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="What is your specific goal? e.g., 'Learn Travis Picking for Landslide'"
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="measurable"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Measurable Outcomes (one per line)</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="How will you measure progress? e.g., Play the song at full speed without mistakes"
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
         <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || skillAreas.length === 0}>
            {form.formState.isSubmitting ? 'Adding Goal...' : 'Add Goal'}
        </Button>
      </form>
    </Form>
  );
}
