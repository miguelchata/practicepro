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
export type GoalLevel = 'Junior' | 'Semi Senior' | 'Senior';

export type Goal = {
  title: string;
  specific: string;
  measurable: string;
  status: GoalStatus;
  projectId?: string;
  userStoryId?: string;
  userStoryTicketId?: string;
  deadline?: string;
  level?: GoalLevel;
  date?: string;
  duration?: number; // duration in seconds
  feedback?: string;
  startTime?: string;
  endTime?: string;
  isLastInSubSkill?: boolean;
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

export type PracticeSession = {
  id: string;
  skillId: string;
  date: string; // ISO string
  duration: number; // in seconds
  whatWentWell: string;
  whatWasDifficult: string;
  goal?: string;
  subSkill?: string;
};


export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export type WorkLog = {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    duration: number; // in seconds
    description?: string;
    pauseCount?: number;
}

export type Task = {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    workLogs?: WorkLog[];
};

export type UserStoryStatus = 'To Do' | 'In Progress' | 'Done';

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

export type VocabularyItem = {
  id: string;
  userId: string;
  word: string;
  definition: string;
  examples: string[];
  type: string;
  accuracy: number;
  alpha: number;
  decayRate: number;
  threshold: number;
  consecutiveSuccesses: number;
  leechCount: number;
  repetitions: number;
  lastQuality: number;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
  ipa?: string;
  recentAttempts?: { quality: number; at: string }[];
};

export type ExerciseType = "guess" | "write" | "both";

export type PracticeItem = {
  wordData: VocabularyItem;
  type: ExerciseType;
  sessionAttempts?: number;
  sessionConsecutiveFails?: number;
  recentQualities?: number[];
  lastShownAt?: number;
  completed: boolean;
};
