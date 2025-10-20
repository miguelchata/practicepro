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
    category: 'Music',
    goals: [], // Legacy
    subSkills: [
      { name: 'Fingerpicking', goals: [{ description: 'Learn Travis Picking style' }] },
      { name: 'Music Theory', goals: [{ description: 'Memorize the notes on the fretboard' }, { description: 'Master the C major scale' }] },
      { name: 'Improvisation', goals: [{ description: 'Improvise a solo over a 12-bar blues' }] },
    ],
    totalHours: 75,
  },
  {
    id: 'public-speaking',
    name: 'Public Speaking',
    icon: Mic,
    category: 'Communication',
    goals: [], // Legacy
    subSkills: [
        { name: 'Storytelling', goals: [{ description: 'Craft a compelling 5-minute story' }] },
        { name: 'Body Language', goals: [{ description: 'Reduce nervous gestures by 50%' }] },
        { name: 'Vocal Variety', goals: [{ description: 'Practice pitch and pace exercises daily' }] },
    ],
    totalHours: 32,
  },
  {
    id: 'python',
    name: 'Python Programming',
    icon: Code,
    category: 'Technology',
    goals: [], // Legacy
    subSkills: [
        { name: 'Data Structures', goals: [{ description: 'Implement a linked list from scratch' }] },
        { name: 'Algorithms', goals: [{ description: 'Solve 10 medium-level problems on LeetCode' }] },
        { name: 'Web Scraping', goals: [] },
        { name: 'APIs', goals: [{ description: 'Build a weather app using a public API' }] },
    ],
    totalHours: 210,
  },
];
