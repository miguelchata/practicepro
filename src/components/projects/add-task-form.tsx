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
import type { Task, TaskStatus, TaskType } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const taskSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required.'),
  type: z.enum(['Frontend', 'Backend', 'Test', 'DevOps', 'Documentation', 'Bug']),
  task: z.string().min(3, 'Task description must be at least 3 characters long.'),
});

type AddTaskFormProps = {
    onTaskAdded: (task: Omit<Task, 'id' | 'status'>) => Promise<void>;
    userStoryTicketId: string;
    existingTasksCount: number;
}

export function AddTaskForm({ onTaskAdded, userStoryTicketId, existingTasksCount }: AddTaskFormProps) {

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskId: '',
      type: 'Frontend',
      task: '',
    },
  });
  
  useEffect(() => {
    const nextId = existingTasksCount + 1;
    const paddedId = String(nextId).padStart(3, '0');
    form.setValue('taskId', `TASK-${paddedId}`);
  }, [existingTasksCount, userStoryTicketId, form]);


  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    const newTask = {
        ...values,
    };
    await onTaskAdded(newTask);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="taskId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Task ID</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., TASK-001" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Task Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Test">Test</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="task"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Create the button component"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          <Save className="mr-2 h-5 w-5" />
          {form.formState.isSubmitting ? 'Saving...' : 'Save Task'}
        </Button>
      </form>
    </Form>
  );
}
