import type { Achievement, Project, Skill, Stat, Goal } from '@/lib/types';
import {
  Code,
  Flame,
  Goal as GoalIcon,
  Guitar,
  Mic,
  Target,
  Trophy,
} from 'lucide-react';

export const stats: Stat[] = [
  {
    label: 'Hours Practiced',
    value: '128',
    icon: GoalIcon,
  },
  {
    label: 'Sessions Logged',
    value: '82',
    icon: Target,
  },
  {
    label: 'Current Streak',
    value: '12 days',
    icon: Flame,
  },
  {
    label: 'Avg. Rating',
    value: '4.2/5',
    icon: Trophy,
  },
];

export const progressChartData = [
  { date: 'Jan', Guitar: 30, Speaking: 20 },
  { date: 'Feb', Guitar: 45, Speaking: 35 },
  { date: 'Mar', Guitar: 50, Speaking: 40 },
  { date: 'Apr', Guitar: 60, Speaking: 55 },
  { date: 'May', Guitar: 75, Speaking: 60 },
  { date: 'Jun', Guitar: 70, Speaking: 65 },
];

export const achievements: Achievement[] = [
  {
    name: 'Practice Starter',
    description: 'Completed your first practice session.',
    unlocked: true,
  },
  {
    name: '7-Day Streak',
    description: 'Practiced for 7 days in a row.',
    unlocked: true,
  },
  {
    name: 'Marathoner',
    description: 'Logged 100 hours of practice.',
    unlocked: false,
  },
  {
    name: 'Journalist',
    description: 'Wrote 10 journal entries.',
    unlocked: true,
  },
  {
    name: 'Goal-Getter',
    description: 'Completed your first goal.',
    unlocked: false,
  },
];

export const aiTasks = [
  {
    task: 'Practice C major scale with a metronome at 120 BPM.',
  },
  {
    task: 'Record yourself presenting the Q2 earnings report.',
  },
  {
    task: 'Implement a binary search algorithm in Python.',
  },
];

export const projects: Omit<Project, 'id' | 'userId' | 'userStories'>[] = [
    {
        title: 'Acoustic Album',
        description: 'Write and record a 5-song acoustic EP.',
        startDate: new Date('2024-05-01').toISOString(),
        targetDate: new Date('2024-09-30').toISOString(),
        status: 'In Progress',
    },
    {
        title: 'Tech Conference Talk',
        description: 'Prepare and deliver a talk on reactive UI patterns.',
        startDate: new Date('2024-06-15').toISOString(),
        targetDate: new Date('2024-08-20').toISOString(),
        status: 'Not Started',
    }
];
