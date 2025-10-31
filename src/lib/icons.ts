import { Code, Brush, Languages, Target } from 'lucide-react';

export const iconMap = {
  Code,
  Design: Brush,
  Language: Languages,
  Other: Target,
};

export const iconNames = Object.keys(iconMap) as (keyof typeof iconMap)[];
