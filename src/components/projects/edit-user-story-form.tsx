'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

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
import { Save } from 'lucide-react';
import type { UserStory } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


const userStorySchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required.'),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  features: z.string().min(3, 'At least one feature is required.'),
  status: z.enum(['Backlog', 'To Do', 'In Progress', 'Need Review', 'Done']),
});

type EditUserStoryFormProps = {
    story: UserStory;
    onUserStoryUpdated: (storyId: string, data: Partial<UserStory>) => Promise<void>;
}

export function EditUserStoryForm({ story, onUserStoryUpdated }: EditUserStoryFormProps) {

  const form = useForm<z.infer<typeof userStorySchema>>({
    resolver: zodResolver(userStorySchema),
    defaultValues: {
      ticketId: story.ticketId,
      title: story.title,
      features: story.features.join('\n'),
      status: story.status,
    },
  });

  useEffect(() => {
    form.reset({
      ticketId: story.ticketId,
      title: story.title,
      features: story.features.join('\n'),
      status: story.status,
    });
  }, [story, form]);


  const onSubmit = async (values: z.infer<typeof userStorySchema>) => {
    const updatedData = {
        ...values,
        features: values.features.split('\n').filter(feature => feature.trim() !== ''),
    };
    await onUserStoryUpdated(story.id, updatedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ticketId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., FR-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Story Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Authentication & User Management" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., User can sign up/login with email/password"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Need Review">Need Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          <Save className="mr-2 h-5 w-5" />
          {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
