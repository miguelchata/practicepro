'use client';

import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ProjectStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';

type ProjectUpdateData = {
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
};

export function useUpdateProject() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const updateProject = async (projectId: string, projectData: ProjectUpdateData) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    try {
      const projectRef = doc(firestore, 'projects', projectId);
      await updateDoc(projectRef, {
        ...projectData
      });

      toast({
        title: 'Project Updated!',
        description: `The "${projectData.title}" project has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem updating your project.',
      });
    }
  };

  return updateProject;
}


export function useDeleteProject() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const deleteProject = async (projectId: string) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Firestore not available.',
            });
            return;
        }

        try {
            await deleteDoc(doc(firestore, 'projects', projectId));
            toast({
                title: 'Project Deleted',
                description: 'The project has been successfully deleted.',
            });
            router.push('/projects');
        } catch (error: any) {
            console.error('Error deleting project:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'There was a problem deleting your project.',
            });
        }
    };

    return deleteProject;
}
