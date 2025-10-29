'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AddTaskForm } from './add-task-form';
import type { Task } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

type AddTaskDialogProps = {
  onTaskAdded: (newTasks: Omit<Task, 'id'> | Omit<Task, 'id'>[]) => Promise<void>;
};

export function AddTaskDialog({ onTaskAdded }: AddTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTasksAdded = async (newTasks: Omit<Task, 'id'> | Omit<Task, 'id'>[]) => {
    await onTaskAdded(newTasks);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project. You can fill out the form or paste in JSON.
          </DialogDescription>
        </DialogHeader>
        <AddTaskForm onTaskAdded={handleTasksAdded} />
      </DialogContent>
    </Dialog>
  );
}
