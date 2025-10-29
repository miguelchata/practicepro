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
import type { Skill, SubSkill } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { iconMap, iconNames } from '@/lib/icons';
import { Target } from 'lucide-react';


const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Skill name must be at least 2 characters.',
  }),
  category: z.string().min(2, { message: 'Category is required.' }),
  subSkills: z.string().optional(),
  icon: z.string(),
});

type EditSkillFormProps = {
  skill: Skill;
  onSkillUpdated: (updatedSkill: Partial<Omit<Skill, 'id' | 'userId'>>) => void;
};

export function EditSkillForm({ skill, onSkillUpdated }: EditSkillFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: skill.name,
      category: skill.category,
      subSkills: skill.subSkills.map(s => s.name).join('\n'),
      icon: skill.icon,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedSkillData = {
      name: values.name,
      category: values.category,
      icon: values.icon,
      subSkills: values.subSkills
        ? values.subSkills.split('\n').filter(s => s.trim() !== '').map((newSubSkillName): SubSkill => {
            const existingSubSkill = skill.subSkills.find(s => s.name === newSubSkillName);
            return existingSubSkill || { name: newSubSkillName, goals: [] };
        })
        : [],
    };
    onSkillUpdated(updatedSkillData);
  }

  const selectedIconName = form.watch('icon');
  const SelectedIcon = iconMap[selectedIconName] || Target;

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
        <div className="grid grid-cols-2 gap-4">
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
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                     <div className="flex items-center gap-2">
                        <SelectedIcon className="h-4 w-4" />
                        <SelectValue />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconNames.map((iconName) => {
                    const Icon = iconMap[iconName];
                    return (
                        <SelectItem key={iconName} value={iconName}>
                           <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{iconName}</span>
                            </div>
                        </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <FormField
          control={form.control}
          name="subSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Areas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List your skill areas, one per line.
e.g., Fingerpicking"
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
