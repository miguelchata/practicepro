import type { LucideIcon } from 'lucide-react';

export type Stat = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type Achievement = {
  name: string;
  description: string;
  unlocked: boolean;
};

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced';

export type Skill = {
  id: string;
  name: string;
  icon: LucideIcon;
  proficiency: SkillProficiency;
  totalHours: number;
  goals: string[];
};
