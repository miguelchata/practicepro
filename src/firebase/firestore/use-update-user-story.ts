'use client';

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserStory } from '@/lib/types';

export function useUpdateUserStory() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const updateUserStory = async (
    projectId: string,
    storyId: string,
    storyData: Partial<UserStory>
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
      const storyRef = doc(firestore, 'projects', projectId, 'userStories', storyId);
      await updateDoc(storyRef, storyData);

      toast({
        title: 'User Story Updated!',
        description: 'The user story has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Error updating user story:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem updating the user story.',
      });
    }
  };

  return updateUserStory;
}

export function useDeleteUserStory() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const deleteUserStory = async (projectId: string, storyId: string) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'projects', projectId, 'userStories', storyId));
      toast({
        title: 'User Story Deleted',
        description: 'The user story has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting user story:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem deleting the user story.',
      });
    }
  };

  return deleteUserStory;
}
