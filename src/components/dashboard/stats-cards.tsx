'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, CheckCircle2, Flame, Timer } from 'lucide-react';

type DashboardStats = {
  total: number;
  mastered: number;
  due: number;
  streak: number;
};

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: 'Total Vocabulary',
      value: stats.total.toString(),
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      label: 'Mastered Words',
      value: stats.mastered.toString(),
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Ready for Review',
      value: stats.due.toString(),
      icon: Timer,
      color: 'text-amber-500',
    },
    {
      label: 'Current Streak',
      value: `${stats.streak} days`,
      icon: Flame,
      color: 'text-orange-500',
    },
  ];

  return (
    <>
      {items.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
