'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Task, WorkLog } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MoreVertical, Edit, Trash2, Play, Square, CheckCircle, Pause } from 'lucide-react';
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

type TimerState = 'idle' | 'running' | 'paused';

type TaskDetailViewProps = {
  task: Task;
  projectId: string;
  onClose: () => void;
};

export function TaskDetailView({ task, projectId, onClose }: TaskDetailViewProps) {
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [isEditing, setIsEditing] = useState(false);

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [displayDuration, setDisplayDuration] = useState(0);

  const activeLog = useMemo(() => {
    if (!activeLogId) return null;
    return task.workLogs?.find(log => log.id === activeLogId) || null;
  }, [task.workLogs, activeLogId]);
  
  const totalDuration = useMemo(() => {
    return task.workLogs?.reduce((acc, log) => acc + log.duration, 0) || 0;
  }, [task.workLogs]);
  
  useEffect(() => {
    const unfinishedLog = task.workLogs?.find(log => !log.endDatetime);
    if(unfinishedLog) {
      setActiveLogId(unfinishedLog.id);
      setTimerState('paused');
      setDisplayDuration(unfinishedLog.duration);
    }
  }, [task.workLogs]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (timerState === 'running' && activeLog) {
      const startTime = new Date(activeLog.startDatetime).getTime();
      const initialDuration = activeLog.duration || 0;

      // When resuming a paused timer, we need to calculate elapsed time since it was last paused, not from the very beginning
      const lastPauseTime = Date.now();
      const elapsedSinceLastStart = (lastPauseTime - startTime); // this is incorrect if paused multiple times
      
      const sessionStartTime = Date.now();

      timer = setInterval(() => {
        const elapsed = Math.round((Date.now() - sessionStartTime) / 1000);
        setDisplayDuration(initialDuration + elapsed);
      }, 1000);
    }
  
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timerState, activeLog]);


  const handleDelete = () => {
    deleteTask(projectId, task.id);
    onClose();
  };

  const handleTaskUpdated = async (updatedData: Partial<Task>) => {
    await updateTask(projectId, task.id, updatedData);
    setIsEditing(false);
  };
  
  const handleToggleTimer = () => {
    if (timerState === 'running') { // Pause
      if(activeLog) {
        const updatedLogs = task.workLogs?.map(log => 
            log.id === activeLog.id ? {...log, duration: displayDuration} : log
        ) || [];
        updateTask(projectId, task.id, { workLogs: updatedLogs });
      }
      setTimerState('paused');
    } else { // Start or Resume
      if (!activeLogId || activeLog?.endDatetime) { // Start new log
          const newLogId = Date.now().toString();
          const newLog: WorkLog = {
              id: newLogId,
              startDatetime: new Date().toISOString(),
              duration: 0,
          };
          const updatedLogs = [...(task.workLogs || []), newLog];
          updateTask(projectId, task.id, { workLogs: updatedLogs });
          setActiveLogId(newLogId);
      }
      setTimerState('running');
    }
  };

  const handleFinishTimer = () => {
     if (activeLogId && activeLog) {
        const endDatetime = new Date().toISOString();
        const updatedLogs = task.workLogs?.map(log => 
            log.id === activeLogId ? {...log, duration: displayDuration, endDatetime } : log
        ) || [];
        updateTask(projectId, task.id, { workLogs: updatedLogs });
     }
    setTimerState('idle');
    setActiveLogId(null);
    setDisplayDuration(0);
  };
  
  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  const formatDate = (isoString: string | undefined, format: 'date' | 'time') => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if(format === 'date') return date.toLocaleDateString();
    return date.toLocaleTimeString();
  };

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
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => {e.stopPropagation();}}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}>
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
        <CardDescription className="flex items-center gap-2 pt-1">
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
                            <p className="text-xs text-muted-foreground">Active session</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                            variant={timerState === 'running' ? 'secondary' : 'default'}
                            onClick={handleToggleTimer}
                            size="sm"
                            >
                            {timerState === 'running' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {timerState === 'running' ? 'Pause' : 'Start'}
                            </Button>
                            {(timerState === 'running' || timerState === 'paused') && (
                            <Button variant="outline" onClick={handleFinishTimer} size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Finish
                            </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h6 className="text-sm font-semibold text-foreground">Work Logs ({formatDuration(totalDuration)})</h6>
                        {task.workLogs && task.workLogs.length > 0 ? (
                           <div className="space-y-2 rounded-md border p-2">
                             {task.workLogs.toReversed().map(log => (
                                <div key={log.id} className="text-xs text-muted-foreground p-2 rounded-md bg-background hover:bg-muted/50">
                                    <div className='flex justify-between items-center font-medium text-foreground'>
                                        <span>{formatDate(log.startDatetime, 'date')}</span>
                                        <Badge variant={log.endDatetime ? "secondary" : "default"}>{log.endDatetime ? formatDuration(log.duration) : "In Progress"}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span>{formatDate(log.startDatetime, 'time')} - {log.endDatetime ? formatDate(log.endDatetime, 'time') : '...'}</span>
                                    </div>
                                </div>
                            ))}
                           </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">No work sessions logged yet.</p>
                        )}
                    </div>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
