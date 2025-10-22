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
import type { Goal, Project, UserStory } from '@/lib/types';
import { Ticket } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUserStories } from '@/firebase/firestore/use-collection';
import { useEffect } from 'react';

const formSchema = z.object({
  specific: z.string().min(3, {
    message: 'Specific goal description must be at least 3 characters.',
  }),
  measurable: z.string().min(3, {
    message: 'Provide at least one measurable outcome, one per line.',
  }),
  projectId: z.string().optional(),
  userStoryId: z.string().optional(),
});

type AddGoalFormProps = {
  onGoalAdded: (newGoal: Goal) => void;
  disabled?: boolean;
  projects: Project[];
};

export function AddGoalForm({ onGoalAdded, disabled, projects }: AddGoalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specific: '',
      measurable: '',
      projectId: 'none',
      userStoryId: 'none',
    },
  });

  const selectedProjectId = form.watch('projectId');
  const { data: userStories } = useUserStories(selectedProjectId === 'none' ? null : selectedProjectId || null);

  useEffect(() => {
    form.setValue('userStoryId', 'none');
  }, [selectedProjectId, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalProjectId = values.projectId === 'none' ? undefined : values.projectId;
    const finalUserStoryId = values.userStoryId === 'none' ? undefined : values.userStoryId;
    const selectedStory = userStories.find(story => story.id === finalUserStoryId);

    const newGoal: Goal = {
        title: values.specific, // Use specific as title
        specific: values.specific,
        measurable: values.measurable.split('\n').filter(m => m.trim() !== ''),
        status: 'Not Started',
        projectId: finalProjectId,
        userStoryId: finalUserStoryId,
        userStoryTicketId: selectedStory?.ticketId,
    };
    onGoalAdded(newGoal);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Link to Project (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="userStoryId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Link to Ticket (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProjectId || selectedProjectId === 'none' || userStories.length === 0}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a ticket" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {userStories.map(story => (
                        <SelectItem key={story.id} value={story.id}>
                            <div className="flex items-center gap-2">
                                <Ticket className="h-4 w-4 text-muted-foreground" />
                                <span>{story.ticketId}: {story.title}</span>
                            </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
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
              <FormLabel>Measurable Outcomes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How will you measure progress? List each outcome on a new line."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={disabled}>
          Add Goal
        </Button>
      </form>
    </Form>
  );
}
