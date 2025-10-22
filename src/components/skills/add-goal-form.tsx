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
import { List, Ticket } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUserStories } from '@/firebase/firestore/use-collection';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

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
  const [step, setStep] = useState(1);
  
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
  const { data: userStories, loading: storiesLoading } = useUserStories(selectedProjectId === 'none' ? null : selectedProjectId || null);

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
    setStep(1);
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (step === 1) {
    return (
        <div className="space-y-4">
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
                        <SelectItem value="none">None (Personal Goal)</SelectItem>
                        {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <Button onClick={() => setStep(2)} className="w-full">
                Next
            </Button>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {selectedProject && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">{selectedProject.title}</CardTitle>
                    <CardDescription>Features for this project:</CardDescription>
                </CardHeader>
                <CardContent>
                    {storiesLoading ? (
                        <p>Loading features...</p>
                    ) : userStories.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {userStories.map(story => (
                                <li key={story.id} className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 flex-shrink-0"/>
                                    <span><strong>{story.ticketId}:</strong> {story.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No features defined for this project yet.</p>
                    )}
                </CardContent>
            </Card>
        )}
        <FormField
        control={form.control}
        name="userStoryId"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Link to Ticket (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProjectId || selectedProjectId === 'none' || userStories.length === 0 || storiesLoading}>
                <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder={storiesLoading ? "Loading tickets..." : "Select a ticket"} />
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
        <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
            </Button>
            <Button type="submit" className="flex-grow" disabled={disabled}>
                Add Goal
            </Button>
        </div>
      </form>
    </Form>
  );
}
