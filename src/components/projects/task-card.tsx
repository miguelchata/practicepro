'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Trash2, Edit, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteTask } from '@/firebase/firestore/use-update-task';
import { cn } from '@/lib/utils';

type TaskCardProps = {
  task: Task;
  projectId: string;
  onTaskSelected: (task: Task) => void;
  isSelected: boolean;
};

export function TaskCard({ task, projectId, onTaskSelected, isSelected }: TaskCardProps) {
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    deleteTask(projectId, task.id);
  };

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
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'bg-card'
      )}
      onClick={() => onTaskSelected(task)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant={priorityVariant[task.priority] || 'secondary'}>{task.priority}</Badge>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => e.stopPropagation()}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Task</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Task</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task <strong>&quot;{task.title}&quot;</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="font-medium leading-tight">{task.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      </CardContent>
    </Card>
  );
}
