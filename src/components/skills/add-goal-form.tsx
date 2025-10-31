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
import type { Goal } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const goalObjectSchema = z.object({
  skillArea: z.string().min(1, 'Skill area is required.'),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  measurable: z.string().min(3, 'Measurable outcome is required.'),
  duration: z.coerce.number().positive().optional(),
});

const jsonSchema = z.union([
    goalObjectSchema,
    z.array(goalObjectSchema)
]);


type AddGoalFormProps = {
  onGoalAdded: (goals: (Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId'> & { skillArea: string })[]) => void;
  skillAreas: string[];
};

export function AddGoalForm({ onGoalAdded, skillAreas }: AddGoalFormProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof goalObjectSchema>>({
    resolver: zodResolver(goalObjectSchema),
    defaultValues: {
      skillArea: skillAreas[0] || '',
      title: '',
      measurable: '',
    },
  });

  function onSubmit(values: z.infer<typeof goalObjectSchema>) {
    const newGoal: Omit<Goal, 'projectId' | 'userStoryId' | 'userStoryTicketId'> & { skillArea: string } = {
        skillArea: values.skillArea,
        title: values.title,
        specific: values.title,
        measurable: values.measurable,
        status: 'Not Started',
        duration: values.duration,
    };
    onGoalAdded([newGoal]);
    form.reset();
  }

  const handleJsonSubmit = () => {
    setJsonError(null);
    if (!jsonInput.trim()) {
        setJsonError('JSON input cannot be empty.');
        return;
    }
    try {
        const parsedJson = JSON.parse(jsonInput);
        const validationResult = jsonSchema.safeParse(parsedJson);

        if (!validationResult.success) {
            setJsonError(validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
            return;
        }

        const data = Array.isArray(validationResult.data) ? validationResult.data : [validationResult.data];

        const goalsToSave = data.map(item => ({
          ...item,
          specific: item.title,
          status: 'Not Started' as const,
        }));
        
        onGoalAdded(goalsToSave);
        setJsonInput('');

    } catch (error) {
        setJsonError('Invalid JSON format.');
    }
  }

  return (
     <Tabs defaultValue="form" className="pt-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
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
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Goal</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="e.g., 'Learn Travis Picking for Landslide'"
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
                        <FormLabel>Measurable Outcome</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="e.g., Play the song at full speed"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Target Duration (minutes)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || skillAreas.length === 0}>
                    {form.formState.isSubmitting ? 'Adding Goal...' : 'Add Goal'}
                </Button>
            </form>
            </Form>
        </TabsContent>
        <TabsContent value="json">
            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="json-input">Goal JSON (Single or Array)</Label>
                    <Textarea
                        id="json-input"
                        placeholder={`{\n  "skillArea": "State Management",\n  "title": "Master Redux",\n  "measurable": "Build a complex app with Redux",\n  "duration": 120\n}`}
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        rows={10}
                        className="font-mono bg-muted/50"
                    />
                     {jsonError && <p className="text-sm font-medium text-destructive">{jsonError}</p>}
                </div>
                <Button onClick={handleJsonSubmit} size="lg" className="w-full">
                    Save from JSON
                </Button>
            </div>
        </TabsContent>
    </Tabs>
  );
}
