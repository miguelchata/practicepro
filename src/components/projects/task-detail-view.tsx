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
import { X, MoreVertical, Edit, Trash2, Play, Pause, CheckCircle, History } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '../ui/skeleton';

type TimerStatus = 'idle' | 'running' | 'paused';

type TaskDetailViewProps = {
  taskId: string;
  projectId: string;
  onClose: () => void;
};

export function TaskDetailView({ taskId, projectId, onClose }: TaskDetailViewProps) {
  const { data: task, loading: taskLoading } = useDoc<Task>(`projects/${projectId}/tasks/${taskId}`);
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [isEditing, setIsEditing] = useState(false);

  // Timer state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [pauseCount, setPauseCount] = useState(0);


  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [logDescription, setLogDescription] = useState('');
  
  const [continuedLog, setContinuedLog] = useState<WorkLog | null>(null);

  const totalDuration = useMemo(() => {
    return task?.workLogs?.reduce((acc, log) => acc + log.duration, 0) || 0;
  }, [task?.workLogs]);

  const todaysLog = useMemo(() => {
    if (!task?.workLogs) return null;

    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const logsFromToday = task.workLogs.filter(log => log.date === todayDateString);
    if (logsFromToday.length === 0) return null;

    // Return the most recent log from today
    return logsFromToday.sort((a, b) => b.id - a.id)[0];
  }, [task?.workLogs]);

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
      // Pausing the timer
      setTimerStatus('paused');
    } else { // idle or paused
      setTimerStatus('running');
      if (timerStatus === 'idle') {
        // Starting a new session
        setElapsedTime(0);
        setPauseCount(0);
        setSessionStartTime(Date.now());
        setContinuedLog(null);
      }
    }
  };

  const handleFinishTimer = () => {
    setTimerStatus('paused');
    setPauseCount(prev => prev + 1);
    setIsLogDialogOpen(true);
  };
  
  const handleSaveLog = async () => {
    if (!task) return;
  
    const endTime = new Date();
    const finalDurationSec = Math.round(elapsedTime);
  
    let updatedLogs: WorkLog[];
    
    const updateData: Partial<Task> = {};

    // Check if this is the first log and the status is 'Backlog'
    if ((!task.workLogs || task.workLogs.length === 0) && task.status === 'Backlog') {
        updateData.status = 'In Progress';
    }


    if (continuedLog) {
      // Update the existing log
      updatedLogs = (task.workLogs || []).map(log => {
        if (log.id === continuedLog.id) {
          return {
            ...log,
            endTime: endTime.toTimeString().split(' ')[0],
            duration: finalDurationSec,
            description: logDescription,
            pauseCount: pauseCount,
          };
        }
        return log;
      });
    } else {
       if (!sessionStartTime) return;
       const startTime = new Date(sessionStartTime);
       const year = startTime.getFullYear();
       const month = (startTime.getMonth() + 1).toString().padStart(2, '0');
       const day = startTime.getDate().toString().padStart(2, '0');
       const localDateString = `${year}-${month}-${day}`;

      // Add a new log
      const newLog: WorkLog = {
        id: endTime.getTime(),
        date: localDateString,
        startTime: startTime.toTimeString().split(' ')[0],
        endTime: endTime.toTimeString().split(' ')[0],
        duration: finalDurationSec,
        description: logDescription,
        pauseCount: pauseCount,
      };
      updatedLogs = [...(task.workLogs || []), newLog];
    }

    updateData.workLogs = updatedLogs;
    await updateTask(projectId, task.id, updateData);
  
    setTimerStatus('idle');
    setElapsedTime(0);
    setSessionStartTime(null);
    setPauseCount(0);
    setLogDescription('');
    setContinuedLog(null);
    setIsLogDialogOpen(false);
  };
  
  const handleContinueSession = (logToContinue: WorkLog) => {
    if (!task) return;
    
    // Set up the timer to continue from where it left off
    setElapsedTime(logToContinue.duration);
    setLogDescription(logToContinue.description || '');
    setContinuedLog(logToContinue);
    setPauseCount(logToContinue.pauseCount || 0);
    setTimerStatus('running'); // Immediately start the timer
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 0) seconds = 0;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} m`);
    
    if (seconds < 60) {
        return `${remainingSeconds} s`;
    }

    if (seconds >= 60 && hours === 0) {
      if (minutes > 0) return `${minutes} m`;
    }
    
    if (parts.length > 0) {
        return parts.join(', ');
    }

    return `${remainingSeconds} s`;
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(projectId, task.id);
    onClose();
  };

  const handleTaskUpdated = async (updatedData: Partial<Task>) => {
    if (!task) return;
    await updateTask(projectId, task.id, updatedData);
    setIsEditing(false);
  };

  const handleFinishTask = async () => {
    if (!task) return;
    await updateTask(projectId, task.id, { status: 'Done' });
  };

  if (taskLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task not found</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 absolute top-4 right-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent>
          <p>This task may have been deleted.</p>
        </CardContent>
      </Card>
    );
  }
  
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
                    {task.status !== 'Done' && (
                       <DropdownMenuItem onSelect={handleFinishTask}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Finish Task</span>
                      </DropdownMenuItem>
                    )}
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
        
        {task.status !== 'Done' && (
          <div className="space-y-4">
              <h5 className="font-semibold text-foreground">Time Tracker</h5>
              {timerStatus === 'idle' ? (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                      <div>
                          <p className="font-mono text-lg font-semibold">{totalDuration > 0 ? formatDuration(totalDuration) : "0 s"}</p>
                          <p className="text-xs text-muted-foreground">Total time logged</p>
                      </div>
                      {todaysLog ? (
                        <Button onClick={() => handleContinueSession(todaysLog)}>
                            <History className="mr-2 h-4 w-4" />
                            Continue
                        </Button>
                      ) : (
                        <Button onClick={handleStartPauseTimer}>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                        </Button>
                      )}
                  </div>
              ) : (
                  <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="font-mono text-2xl font-bold text-primary">{formatDuration(elapsedTime)}</p>
                              <p className="text-xs text-primary/80">Active session {pauseCount > 0 ? `(${pauseCount} pauses)` : ''}</p>
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
          </div>
        )}
        
        <div className="space-y-3">
            <h6 className="font-semibold">Work Logs {totalDuration > 0 ? `(${formatDuration(totalDuration)})` : ''}</h6>
            {task.workLogs && task.workLogs.length > 0 ? (
                <ul className="space-y-3">
                    {task.workLogs.sort((a,b) => b.id - a.id).map((log) => {
                        const logDate = new Date(log.date + 'T00:00:00');
                      
                        return (
                          log.endTime && (
                            <li key={log.id} className="rounded-lg border p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{logDate.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.startTime} - {log.endTime}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatDuration(log.duration)}</p>
                                        {log.pauseCount && log.pauseCount > 0 && <p className='text-xs text-amber-600'>{log.pauseCount} {log.pauseCount === 1 ? 'pause' : 'pauses'}</p>}
                                    </div>
                                </div>
                                {log.description && <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">{log.description}</p>}
                            </li>
                          )
                        )
                    })}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No work sessions logged yet.</p>
            )}
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
