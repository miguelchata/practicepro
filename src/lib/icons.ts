import { Code, Guitar, Mic, Target, Brain, BookOpen, Brush, Film, Dumbbell, Languages } from 'lucide-react';

export const iconMap = {
  Guitar,
  Mic,
  Code,
  Target,
  Brain,
  BookOpen,
  Brush,
  Film,
  Dumbbell,
  Languages,
};

export const iconNames = Object.keys(iconMap) as (keyof typeof iconMap)[];
