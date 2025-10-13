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

export type Goal = {
  description: string;
  target?: number;
  unit?: string;
  deadline?: string; // Storing as ISO string
};

export type Skill = {
  id:string;
  name: string;
  icon: LucideIcon;
  proficiency: SkillProficiency;
  totalHours: number;
  goals: Goal[];
  subSkills: string[];
};
