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
import { X, MoreVertical, Edit, Trash2, Play, Pause, CheckCircle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type TimerStatus = 'idle' | 'running' | 'paused';

type TaskDetailViewProps = {
  task: Task;
  projectId: string;
  onClose: () => void;
};

export function TaskDetailView({ task, projectId, onClose }: TaskDetailViewProps) {
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [isEditing, setIsEditing] = useState(false);

  // Timer state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [logDescription, setLogDescription] = useState('');

  const totalDuration = useMemo(() => {
    return task.workLogs?.reduce((acc, log) => acc + log.duration, 0) || 0;
  }, [task.workLogs]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStatus === 'running') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus]);


  const handleStartPauseTimer = () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
      const now = Date.now();
      const newWorkLogs = (task.workLogs || []).map(log => {
        if (log.id === activeLogId) {
          return { ...log, pauses: [...(log.pauses || []), { start: now }] };
        }
        return log;
      });
      updateTask(projectId, task.id, { workLogs: newWorkLogs });
    } else { // idle or paused
      setTimerStatus('running');
      const now = Date.now();
      if (timerStatus === 'idle') {
        const newLogId = Date.now();
        setActiveLogId(newLogId);
        const newLog: WorkLog = { 
          id: newLogId,
          startDatetime: new Date(now).toISOString(),
          duration: 0,
          pauses: []
        };
        updateTask(projectId, task.id, { workLogs: [...(task.workLogs || []), newLog] });
      } else { // paused
        const newWorkLogs = (task.workLogs || []).map(log => {
          if (log.id === activeLogId && log.pauses && log.pauses.length > 0) {
            const lastPause = log.pauses[log.pauses.length - 1];
            if (lastPause.start && !lastPause.end) {
              lastPause.end = now;
            }
          }
          return log;
        });
        updateTask(projectId, task.id, { workLogs: newWorkLogs });
      }
    }
  };

  const handleFinishTimer = () => {
    setTimerStatus('paused');
    setIsLogDialogOpen(true);
  };
  
  const handleSaveLog = () => {
    const endDatetime = new Date().toISOString();
    const activeLog = (task.workLogs || []).find(log => log.id === activeLogId);
    
    if (!activeLog) return;

    let pauseDuration = 0;
    activeLog.pauses?.forEach(p => {
        if (p.start && p.end) {
            pauseDuration += (p.end - p.start);
        }
    });

    const finalDuration = Math.max(0, elapsedTime);
    const lostTime = Math.round(pauseDuration / 1000);

    const updatedLogs = (task.workLogs || []).map(log => 
        log.id === activeLogId 
            ? { ...log, endDatetime, duration: finalDuration, description: logDescription, lostTime } 
            : log
    );

    updateTask(projectId, task.id, { workLogs: updatedLogs });
    
    // Reset state
    setTimerStatus('idle');
    setElapsedTime(0);
    setActiveLogId(null);
    setLogDescription('');
    setIsLogDialogOpen(false);
  };


  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const handleDelete = () => {
    deleteTask(projectId, task.id);
    onClose();
  };

  const handleTaskUpdated = async (updatedData: Partial<Task>) => {
    await updateTask(projectId, task.id, updatedData);
    setIsEditing(false);
  };
  
  const priorityVariant = {
    Low: 'secondary',
    Medium: 'outline',
    High: 'default',
    Urgent: 'destructive',
  } as const;

  return (
    <>
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
      <CardContent className="space-y-6">
        {isEditing ? (
            <EditTaskForm task={task} onTaskUpdated={handleTaskUpdated} onCancel={() => setIsEditing(false)} />
        ) : (
            <>
                <div className="space-y-1">
                  <h5 className="font-semibold text-foreground">Description</h5>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
            </>
        )}
        <Separator />

        <div className="space-y-4">
            <h5 className="font-semibold text-foreground">Time Tracker</h5>
            {timerStatus === 'idle' ? (
                 <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                    <div>
                        <p className="font-mono text-lg font-semibold">{formatDuration(totalDuration)}</p>
                        <p className="text-xs text-muted-foreground">Total time logged</p>
                    </div>
                    <Button onClick={handleStartPauseTimer}>
                        <Play className="mr-2 h-4 w-4" />
                        Start
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-mono text-2xl font-bold text-primary">{formatDuration(elapsedTime)}</p>
                            <p className="text-xs text-primary/80">Active session</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={handleStartPauseTimer}>
                                {timerStatus === 'running' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                             <Button variant="secondary" onClick={handleFinishTimer}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Finish
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="space-y-3">
                <h6 className="font-semibold">Work Logs ({formatDuration(totalDuration)})</h6>
                {task.workLogs && task.workLogs.length > 0 ? (
                    <ul className="space-y-3">
                        {task.workLogs.sort((a,b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()).map((log) => (
                           log.endDatetime && (
                            <li key={log.id} className="rounded-lg border p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{new Date(log.startDatetime).toLocaleDateString()}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(log.startDatetime).toLocaleTimeString()} - {new Date(log.endDatetime!).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatDuration(log.duration)}</p>
                                        {log.lostTime && log.lostTime > 0 && <p className='text-xs text-amber-600'>Paused: {formatDuration(log.lostTime)}</p>}
                                    </div>
                                </div>
                                {log.description && <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">{log.description}</p>}
                            </li>
                           )
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No work sessions logged yet.</p>
                )}
            </div>
        </div>

      </CardContent>
    </Card>
    <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Log Your Work</DialogTitle>
                <DialogDescription>
                    Add a description for the work session you just completed.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="log-description">Description (optional)</Label>
                <Textarea 
                    id="log-description"
                    rows={4}
                    placeholder="What did you work on? What went well? What was challenging?"
                    value={logDescription}
                    onChange={(e) => setLogDescription(e.target.value)}
                />
            </div>
            <Button onClick={handleSaveLog}>Save Log</Button>
        </DialogContent>
    </Dialog>
    </>
  );
}
