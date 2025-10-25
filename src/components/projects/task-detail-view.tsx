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
import { X, MoreVertical, Edit, Trash2 } from 'lucide-react';
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


type TaskDetailViewProps = {
  task: Task;
  projectId: string;
  onClose: () => void;
};

export function TaskDetailView({ task, projectId, onClose }: TaskDetailViewProps) {
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    deleteTask(projectId, task.id);
    onClose();
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
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
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
          </div>
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
