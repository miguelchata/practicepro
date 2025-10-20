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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Goal } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  specific: z.string().min(3, {
    message: 'Specific goal description must be at least 3 characters.',
  }),
  measurable: z.string().min(3, {
    message: 'Provide at least one measurable outcome, one per line.',
  }),
  achievable: z.string().min(3, {
    message: 'Achievable statement must be at least 3 characters.',
  }),
  relevant: z.string().min(3, {
    message: 'Relevant statement must be at least 3 characters.',
  }),
  timeBound: z.string().min(3, {
    message: 'Time-bound statement must be at least 3 characters.',
  }),
  deadline: z.date().optional(),
});

type AddGoalFormProps = {
  onGoalAdded: (newGoal: Goal) => void;
};

export function AddGoalForm({ onGoalAdded }: AddGoalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newGoal: Goal = {
        ...values,
        measurable: values.measurable.split('\n').filter(m => m.trim() !== ''),
        deadline: values.deadline?.toISOString(),
        status: 'Not Started',
    };
    onGoalAdded(newGoal);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Build Persistent To-Do List"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specific"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What exactly do you want to accomplish?"
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
              <FormLabel>Measurable</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How will you measure progress? List each item on a new line."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="achievable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achievable</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Is this goal realistic and attainable? How?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="relevant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relevant</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Why is this goal important to you?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="timeBound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time-bound</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is the deadline for this goal?"
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
              <FormLabel>Deadline Date (Optional)</FormLabel>
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
        <Button type="submit" className="w-full">
          Add SMART Goal
        </Button>
      </form>
    </Form>
  );
}
