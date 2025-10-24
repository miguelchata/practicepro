'use client';

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';

export function useUpdateTask() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const updateTask = async (
    projectId: string,
    taskId: string,
    taskData: Partial<Task>
  ) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    try {
      const taskRef = doc(firestore, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, taskData);

      // No toast for silent updates like drag-and-drop
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem updating the task.',
      });
    }
  };

  return updateTask;
}

export function useDeleteTask() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const deleteTask = async (projectId: string, taskId: string) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'projects', projectId, 'tasks', taskId));
      toast({
        title: 'Task Deleted',
        description: 'The task has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem deleting the task.',
      });
    }
  };

  return deleteTask;
}
