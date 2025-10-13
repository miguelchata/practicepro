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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Skill, SkillProficiency } from '@/lib/types';

const proficiencyLevels: SkillProficiency[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Skill name must be at least 2 characters.',
  }),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  goals: z.string().min(1, { message: 'Please set at least one goal.' }),
});

type AddSkillFormProps = {
    onSkillAdded: (newSkill: Omit<Skill, 'id' | 'totalHours' | 'icon'>) => void;
};

export function AddSkillForm({ onSkillAdded }: AddSkillFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      proficiency: 'Beginner',
      goals: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSkill = {
        name: values.name,
        proficiency: values.proficiency,
        goals: values.goals.split('\n').filter(g => g.trim() !== ''),
    }
    onSkillAdded(newSkill);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Playing Piano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proficiency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proficiency Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your proficiency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
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
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Goals</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List your goals, one per line.&#10;e.g., Learn to play Moonlight Sonata"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Skill</Button>
      </form>
    </Form>
  );
}
