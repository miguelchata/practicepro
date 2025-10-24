'use client';

import { addDoc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';

export function useAddTask() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const addTask = async (projectId: string, taskData: Omit<Task, 'id'>) => {
    if (!firestore || !projectId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add task. Project not specified.',
      });
      return;
    }

    try {
      const tasksCollectionRef = collection(firestore, 'projects', projectId, 'tasks');
      await addDoc(tasksCollectionRef, taskData);

      toast({
        title: 'Task Added!',
        description: `The task "${taskData.title}" has been added to the project.`,
      });
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem adding your task.',
      });
    }
  };

  return addTask;
}
