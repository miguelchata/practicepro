'use client';

import { addDoc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserStory } from '@/lib/types';

export function useAddUserStory() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const addUserStory = async (projectId: string, userStoryData: Omit<UserStory, 'id'>) => {
    if (!firestore || !projectId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add user story. Project not specified.',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'projects', projectId, 'userStories'), {
        ...userStoryData,
      });

      toast({
        title: 'User Story Added!',
        description: `The story "${userStoryData.title}" has been added to the project.`,
      });
    } catch (error: any) {
      console.error('Error adding user story:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem adding your user story.',
      });
    }
  };

  return addUserStory;
}
