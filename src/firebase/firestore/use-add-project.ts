'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectStatus } from '@/lib/types';

type NewProjectData = {
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
};

export function useAddProject() {
  const firestore = useFirestore();
  const { data: user } = useUser();
  const { toast } = useToast();

  const addProject = async (projectData: NewProjectData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a project.',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'projects'), {
        ...projectData,
        userId: user.uid,
      });

      toast({
        title: 'Project Created!',
        description: `The "${projectData.title}" project has been successfully created.`,
      });
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem creating your project.',
      });
    }
  };

  return addProject;
}
