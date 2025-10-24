'use client';

import { writeBatch, collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';

export function useAddTasks() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const addTasks = async (projectId: string, tasksData: Omit<Task, 'id'> | Omit<Task, 'id'>[]) => {
    if (!firestore || !projectId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add task(s). Project not specified.',
      });
      return;
    }

    const tasksToAdd = Array.isArray(tasksData) ? tasksData : [tasksData];

    if (tasksToAdd.length === 0) {
      return;
    }

    try {
      const batch = writeBatch(firestore);
      const tasksCollectionRef = collection(firestore, 'projects', projectId, 'tasks');
      
      tasksToAdd.forEach(taskData => {
        const newTaskRef = doc(tasksCollectionRef);
        batch.set(newTaskRef, taskData);
      });

      await batch.commit();

      toast({
        title: 'Tasks Added!',
        description: `${tasksToAdd.length} task(s) have been successfully added.`,
      });
    } catch (error: any) {
      console.error('Error adding tasks in batch:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem adding your tasks.',
      });
    }
  };

  return addTasks;
}