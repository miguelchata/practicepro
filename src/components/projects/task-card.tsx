'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteTask } from '@/firebase/firestore/use-update-task';

type TaskCardProps = {
  task: Task;
  projectId: string;
};

export function TaskCard({ task, projectId }: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
    <>
      <Card
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          window.localStorage.setItem('draggingTask', JSON.stringify(task));
        }}
        className="cursor-grab active:cursor-grabbing"
        onClick={() => setIsDetailsOpen(true)}
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
                  <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)}>
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Task</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
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

      {/* Task Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="flex items-center gap-2">
                {task.title}
              </DialogTitle>
              <Badge>{task.status}</Badge>
            </div>
            <DialogDescription>
              <Badge variant="outline">{task.priority}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-6">
            <div>
              <h5 className="font-semibold text-foreground">Description</h5>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
