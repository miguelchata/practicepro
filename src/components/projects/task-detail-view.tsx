'use client';

import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type TaskDetailViewProps = {
  task: Task;
  onClose: () => void;
};

export function TaskDetailView({ task, onClose }: TaskDetailViewProps) {
  const priorityVariant = {
    Low: 'secondary',
    Medium: 'outline',
    High: 'default',
    Urgent: 'destructive',
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-headline flex-1 pr-8">{task.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardDescription>
            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <h5 className="font-semibold text-foreground mb-2">Description</h5>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
        <div className="mt-4">
            <h5 className="font-semibold text-foreground mb-2">Status</h5>
            <Badge variant="outline">{task.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
