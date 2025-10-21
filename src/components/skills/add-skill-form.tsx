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

type AddSkillFormProps = {
  onSkillAdded: (newSkill: Omit<Skill, 'id' | 'totalHours' | 'userId' | 'subSkills'> & { subSkills?: string }) => void;
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
      subSkills: '',
      icon: 'Target',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSkill = {
      name: values.name,
      category: values.category,
      subSkills: values.subSkills,
      icon: values.icon,
    };
    onSkillAdded(newSkill);
    form.reset();
    setShowNewCategory(false);
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
                  value={showNewCategory ? 'new' : field.value}
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
                      {...field}
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
              <FormLabel>Sub-Skills</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List your sub-skills, one per line.
e.g., Fingerpicking"
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
