'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';

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
import type { Task } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { useAddTasks } from '@/firebase/firestore/use-update-user-story';

const taskSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required.'),
  type: z.enum(['Frontend', 'Backend', 'Test', 'DevOps', 'Documentation', 'Bug']),
  task: z.string().min(3, 'Task description must be at least 3 characters long.'),
});

const jsonTaskSchema = z.object({
  taskId: z.string(),
  type: z.enum(['Frontend', 'Backend', 'Test', 'DevOps', 'Documentation', 'Bug']),
  task: z.string(),
});

const jsonTasksSchema = z.union([jsonTaskSchema, z.array(jsonTaskSchema)]);


type AddTaskFormProps = {
    onTaskAdded: (task: Omit<Task, 'id' | 'status'>) => Promise<void>;
    onTasksAdded: (tasks: Omit<Task, 'id' | 'status'>[]) => Promise<void>;
    userStoryTicketId: string;
    existingTasksCount: number;
}

export function AddTaskForm({ onTaskAdded, onTasksAdded, userStoryTicketId, existingTasksCount }: AddTaskFormProps) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  
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

  const handleJsonSubmit = async () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const validatedJson = jsonTasksSchema.parse(parsedJson);

      const tasksToAdd = Array.isArray(validatedJson) ? validatedJson : [validatedJson];

      await onTasksAdded(tasksToAdd);
      setJsonInput('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid JSON',
        description: 'The provided JSON is either malformed or does not match the required schema for a single task or an array of tasks.',
      });
    }
  };

  return (
    <Tabs defaultValue="form" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="form">Form</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="form">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
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
      </TabsContent>
      <TabsContent value="json">
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="json-input">Task JSON (Single Object or Array)</Label>
                <Textarea
                    id="json-input"
                    placeholder={`[\n  {\n    "taskId": "TASK-001",\n    "type": "Frontend",\n    "task": "Create the button component"\n  }\n]`}
                    rows={8}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                />
            </div>
            <Button size="lg" className="w-full" onClick={handleJsonSubmit}>
              <Save className="mr-2 h-5 w-5" />
              Save from JSON
            </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
