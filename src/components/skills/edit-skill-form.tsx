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
import type { Skill } from '@/lib/types';


const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Skill name must be at least 2 characters.',
  }),
  category: z.string().min(2, { message: 'Category is required.' }),
  subSkills: z.string().optional(),
});

type EditSkillFormProps = {
  skill: Skill;
  onSkillUpdated: (updatedSkill: Pick<Skill, 'name' | 'category' | 'subSkills'>) => void;
};

export function EditSkillForm({ skill, onSkillUpdated }: EditSkillFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: skill.name,
      category: skill.category,
      subSkills: skill.subSkills.map(s => s.name).join('\n'),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedSkill = {
      name: values.name,
      category: values.category,
      // This preserves existing goals for existing subskills
      subSkills: values.subSkills
        ? values.subSkills.split('\n').filter(s => s.trim() !== '').map(newSubSkillName => {
            const existingSubSkill = skill.subSkills.find(s => s.name === newSubSkillName);
            return existingSubSkill || { name: newSubSkillName, goals: [] };
        })
        : [],
    };
    onSkillUpdated(updatedSkill);
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
              <FormControl>
                <Input placeholder="e.g., Music" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-Skills</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List your sub-skills, one per line.&#10;e.g., Fingerpicking"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </Form>
  );
}
