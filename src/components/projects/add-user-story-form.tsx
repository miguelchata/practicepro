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


const userStorySchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required.'),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  features: z.string().min(3, 'At least one feature is required.'),
});

type AddUserStoryFormProps = {
    onUserStoryAdded: (userStory: Omit<UserStory, 'id'>) => Promise<void>;
    existingStoriesCount: number;
}

export function AddUserStoryForm({ onUserStoryAdded, existingStoriesCount }: AddUserStoryFormProps) {

  const form = useForm<z.infer<typeof userStorySchema>>({
    resolver: zodResolver(userStorySchema),
    defaultValues: {
      ticketId: '',
      title: '',
      features: '',
    },
  });
  
  useEffect(() => {
    const nextId = existingStoriesCount + 1;
    const paddedId = String(nextId).padStart(3, '0');
    form.setValue('ticketId', `FR-${paddedId}`);
  }, [existingStoriesCount, form]);


  const onSubmit = async (values: z.infer<typeof userStorySchema>) => {
    const newUserStory = {
        ...values,
        features: values.features.split('\n').filter(feature => feature.trim() !== ''),
    };
    await onUserStoryAdded(newUserStory);
    form.reset();
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
                <Input placeholder="e.g., FR-001" {...field} readOnly />
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
        
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          <Save className="mr-2 h-5 w-5" />
          {form.formState.isSubmitting ? 'Saving...' : 'Save User Story'}
        </Button>
      </form>
    </Form>
  );
}
