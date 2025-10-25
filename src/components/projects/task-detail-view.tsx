'use client';

import { useState, useEffect } from 'react';
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
import { X, MoreVertical, Edit, Trash2, Play, Square } from 'lucide-react';
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
import { useDeleteTask, useUpdateTask } from '@/firebase/firestore/use-update-task';
import { EditTaskForm } from './edit-task-form';
import { Separator } from '../ui/separator';


type TaskDetailViewProps = {
  task: Task;
  projectId: string;
  onClose: () => void;
};

export function TaskDetailView({ task, projectId, onClose }: TaskDetailViewProps) {
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [isEditing, setIsEditing] = useState(false);
  const [isTiming, setIsTiming] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [displayDuration, setDisplayDuration] = useState(task.duration || 0);

  useEffect(() => {
    setDisplayDuration(task.duration || 0);
  }, [task.duration]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTiming && startTime) {
      timer = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        setDisplayDuration((task.duration || 0) + elapsed);
      }, 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTiming, startTime, task.duration]);


  const handleDelete = () => {
    deleteTask(projectId, task.id);
    onClose();
  };

  const handleTaskUpdated = async (updatedData: Partial<Task>) => {
    await updateTask(projectId, task.id, updatedData);
    setIsEditing(false);
  };
  
  const handleToggleTimer = () => {
    if (isTiming) {
      // Finish timer
      const endTime = new Date();
      const duration = startTime ? Math.round((endTime.getTime() - startTime) / 1000) : 0;
      const finalDuration = (task.duration || 0) + duration;
      updateTask(projectId, task.id, { 
          endDatetime: endTime.toISOString(),
          duration: finalDuration,
      });
      setIsTiming(false);
      setStartTime(null);
      setDisplayDuration(finalDuration);
    } else {
      // Start timer
      const newStartTime = new Date();
      setStartTime(newStartTime.getTime());
      updateTask(projectId, task.id, { startDatetime: newStartTime.toISOString() });
      setIsTiming(true);
    }
  };
  
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

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
          <div className='flex items-center gap-2'>
             <AlertDialog>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={() => setIsEditing(true)}>
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
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline">{task.status}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
            <EditTaskForm task={task} onTaskUpdated={handleTaskUpdated} onCancel={() => setIsEditing(false)} />
        ) : (
            <>
                <div className="space-y-1">
                  <h5 className="font-semibold text-foreground">Description</h5>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <Separator />
                 <div className="space-y-3">
                    <h5 className="font-semibold text-foreground">Time Tracker</h5>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                        <div>
                            <p className="font-mono text-lg font-semibold">{formatDuration(displayDuration)}</p>
                            <p className="text-xs text-muted-foreground">Total time logged</p>
                        </div>
                        <Button
                            variant={isTiming ? 'destructive' : 'default'}
                            onClick={handleToggleTimer}
                        >
                            {isTiming ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {isTiming ? 'Finish Timer' : 'Start Timer'}
                        </Button>
                    </div>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
