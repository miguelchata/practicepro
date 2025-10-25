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
  status: GoalStatus;
  projectId?: string;
  userStoryId?: string;
  userStoryTicketId?: string;
};

export type SubSkill = {
  name: string;
  goals: Goal[];
}

export type Skill = {
  id:string;
  name: string;
  icon: string; // Storing icon name as string for Firestore
  category: string;
  totalHours: number;
  subSkills: SubSkill[];
  userId: string;
};

export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Backlog' | 'In Progress' | 'Done';

export type WorkLog = {
    id: string;
    startDatetime: string;
    endDatetime?: string;
    duration: number; // in seconds
}

export type Task = {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    workLogs?: WorkLog[];
};

export type UserStoryStatus = 'Backlog' | 'In Progress' | 'Done';

export type UserStory = {
    id: string;
    ticketId: string;
    title: string;
    features: string[];
    tasks?: Task[];
    status: UserStoryStatus;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
  tasks?: Task[];
  ticketPrefix?: string;
};
