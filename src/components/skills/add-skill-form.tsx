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
import type { Skill } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Skill name must be at least 2 characters.',
  }),
  category: z.string().min(2, { message: 'Category is required.' }),
  goals: z.string().min(1, { message: 'Please set at least one goal.' }),
});

type AddSkillFormProps = {
  onSkillAdded: (newSkill: Omit<Skill, 'id' | 'totalHours' | 'icon'>) => void;
  categories: string[];
};

export function AddSkillForm({
  onSkillAdded,
  categories,
}: AddSkillFormProps) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      goals: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSkill = {
      name: values.name,
      category: values.category,
      goals: values.goals
        .split('\n')
        .filter((g) => g.trim() !== '')
        .map((g) => ({ description: g })),
      subSkills: [],
    };
    onSkillAdded(newSkill);
    form.reset();
    setShowNewCategory(false);
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={(value) => {
                  if (value === 'new') {
                    setShowNewCategory(true);
                    field.onChange('');
                  } else {
                    setShowNewCategory(false);
                    field.onChange(value);
                  }
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">Create new category...</SelectItem>
                </SelectContent>
              </Select>
              {showNewCategory && (
                <FormControl>
                  <Input
                    placeholder="New category name"
                    onChange={field.onChange}
                    className="mt-2"
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Goal</FormLabel>
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
        <Button type="submit" className="w-full">
          Add Skill
        </Button>
      </form>
    </Form>
  );
}
