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
  goal: z.string().min(3, 'Goal must be at least 3 characters.'),
  outcome: z.string().min(3, 'Outcome is required.'),
  duration: z.coerce.number().positive().optional(),
  level: z.enum(['Junior', 'Semi Senior', 'Senior']).optional(),
  requires: z.string().optional(),
});

const jsonSchema = z.union([
    z.object({
        skillArea: z.string().min(1, 'Skill area is required.'),
        goal: z.string().min(3, 'Goal must be at least 3 characters.'),
        outcome: z.string().min(3, 'Outcome is required.'),
        level: z.enum(['Junior', 'Semi Senior', 'Senior']).optional(),
        requires: z.string().optional(),
    }),
    z.array(z.object({
        skillArea: z.string().min(1, 'Skill area is required.'),
        goal: z.string().min(3, 'Goal must be at least 3 characters.'),
        outcome: z.string().min(3, 'Outcome is required.'),
        level: z.enum(['Junior', 'Semi Senior', 'Senior']).optional(),
        requires: z.string().optional(),
    }))
]);


type AddGoalFormProps = {
  onGoalAdded: (goals: (Omit<Goal, 'id' | 'projectId' | 'userStoryId' | 'userStoryTicketId'> & { skillArea: string })[]) => void;
  skillAreas: string[];
};

export function AddGoalForm({ onGoalAdded, skillAreas }: AddGoalFormProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof goalObjectSchema>>({
    resolver: zodResolver(goalObjectSchema),
    defaultValues: {
      skillArea: skillAreas[0] || '',
      goal: '',
      outcome: '',
      level: 'Junior',
      requires: '',
    },
  });

  function onSubmit(values: z.infer<typeof goalObjectSchema>) {
    const newGoal: Omit<Goal, 'id' |'projectId' | 'userStoryId' | 'userStoryTicketId'> & { skillArea: string } = {
        skillArea: values.skillArea,
        title: values.goal,
        specific: values.goal,
        measurable: values.outcome,
        status: 'Not Started',
        level: values.level,
        requires: values.requires ? values.requires.split(',').map(s => s.trim()).filter(Boolean) : [],
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
          title: item.goal,
          specific: item.goal,
          measurable: item.outcome,
          status: 'Not Started' as const,
          requires: item.requires ? item.requires.split(',').map(s => s.trim()).filter(Boolean) : [],
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
                    name="goal"
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
                    name="outcome"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Outcome</FormLabel>
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
                    name="requires"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Required Goal IDs (Optional)</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Paste comma-separated goal IDs"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Junior">Junior</SelectItem>
                                    <SelectItem value="Semi Senior">Semi Senior</SelectItem>
                                    <SelectItem value="Senior">Senior</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
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
                        placeholder={`{\n  "skillArea": "State Management",\n  "goal": "Master Redux",\n  "outcome": "Build a complex app with Redux",\n  "level": "Junior",\n  "requires": "id1,id2"\n}`}
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
