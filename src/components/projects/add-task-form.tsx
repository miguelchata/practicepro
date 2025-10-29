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
import { Save } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useState } from 'react';
import { useAddTasks } from '@/firebase/firestore/use-add-tasks';
import { Label } from '../ui/label';

const taskObjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(3, 'Description is required.'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
});

const taskSchema = z.union([
    taskObjectSchema,
    z.array(taskObjectSchema)
]);


type AddTaskFormProps = {
    onTaskAdded: (task: Omit<Task, 'id'> | Omit<Task, 'id'>[]) => Promise<void>;
    existingTasksCount: number;
}

export function AddTaskForm({ onTaskAdded, existingTasksCount }: AddTaskFormProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof taskObjectSchema>>({
    resolver: zodResolver(taskObjectSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'To Do',
    },
  });

  const onSubmit = async (values: z.infer<typeof taskObjectSchema>) => {
    await onTaskAdded(values);
    form.reset();
  };

  const handleJsonSubmit = async () => {
    setJsonError(null);
    if (!jsonInput.trim()) {
        setJsonError('JSON input cannot be empty.');
        return;
    }
    try {
        const parsedJson = JSON.parse(jsonInput);
        const validationResult = taskSchema.safeParse(parsedJson);

        if (!validationResult.success) {
            setJsonError(validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
            return;
        }

        await onTaskAdded(validationResult.data);
        setJsonInput('');

    } catch (error) {
        setJsonError('Invalid JSON format.');
    }
  }

  return (
    <Tabs defaultValue="form">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Implement user authentication" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="e.g., User should be able to sign up and log in..."
                        rows={5}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a priority" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
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
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
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
                        placeholder={`{\n  "title": "Create button component",\n  "description": "Button with all variants",\n  "priority": "High",\n  "status": "To Do"\n}`}
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        rows={10}
                        className="font-mono"
                    />
                     {jsonError && <p className="text-sm font-medium text-destructive">{jsonError}</p>}
                </div>
                <Button onClick={handleJsonSubmit} size="lg" className="w-full">
                    <Save className="mr-2 h-5 w-5" />
                    Save from JSON
                </Button>
            </div>
        </TabsContent>
    </Tabs>
  );
}
