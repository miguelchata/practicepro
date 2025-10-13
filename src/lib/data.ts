import type { Achievement, Skill, Stat } from '@/lib/types';
import {
  Book,
  Bot,
  Code,
  Flame,
  Github,
  Gitlab,
  Goal,
  Guitar,
  Mic,
  Presentation,
  Target,
  Trophy,
} from 'lucide-react';

export const stats: Stat[] = [
  {
    label: 'Hours Practiced',
    value: '128',
    icon: Goal,
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

export const skills: Skill[] = [
  {
    id: 'guitar',
    name: 'Guitar',
    icon: Guitar,
    proficiency: 'Intermediate',
    goals: [
        { description: 'Master bar chords' }, 
        { description: 'Learn "Stairway to Heaven" solo' }
    ],
    subSkills: ['Fingerpicking', 'Music Theory', 'Improvisation'],
    totalHours: 75,
  },
  {
    id: 'public-speaking',
    name: 'Public Speaking',
    icon: Mic,
    proficiency: 'Beginner',
    goals: [
        { description: 'Reduce filler words' }, 
        { description: 'Improve stage presence' }
    ],
    subSkills: ['Storytelling', 'Body Language', 'Vocal Variety'],
    totalHours: 32,
  },
  {
    id: 'python',
    name: 'Python Programming',
    icon: Code,
    proficiency: 'Advanced',
    goals: [
        { description: 'Build a Django web app' }, 
        { description: 'Contribute to an open-source project' }
    ],
    subSkills: ['Data Structures', 'Algorithms', 'Web Scraping', 'APIs'],
    totalHours: 210,
  },
];
