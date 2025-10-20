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

export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed';

export type Goal = {
  title: string;
  specific: string;
  measurable: string[];
  deadline?: string; // Storing as ISO string
  status: GoalStatus;
};

export type SubSkill = {
  name: string;
  goals: Goal[];
}

export type Skill = {
  id:string;
  name: string;
  icon: LucideIcon;
  category: string;
  totalHours: number;
  goals: []; // Kept for legacy data, new structure uses subSkills
  subSkills: SubSkill[];
};

export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';

export type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
};
