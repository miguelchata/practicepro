'use client';

import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


type TaskCardProps = {
  task: Task;
  projectId: string;
  onTaskSelected: (taskId: string) => void;
};

export function TaskCard({ task, onTaskSelected }: TaskCardProps) {

  const priorityVariant = {
    Low: 'secondary',
    Medium: 'outline',
    High: 'default',
    Urgent: 'destructive',
  } as const;

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        window.localStorage.setItem('draggingTask', JSON.stringify(task));
      }}
      className="cursor-pointer transition-shadow hover:shadow-md bg-card"
      onClick={() => onTaskSelected(task.id)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant={priorityVariant[task.priority] || 'secondary'}>{task.priority}</Badge>
        </div>
        <p className="font-medium leading-tight">{task.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      </CardContent>
    </Card>
  );
}
