'use client';

import { addDoc, collection, doc, runTransaction } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserStory } from '@/lib/types';

function generatePrefix() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 2; i++) {
    prefix += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return prefix;
}

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
      await runTransaction(firestore, async (transaction) => {
        const projectRef = doc(firestore, 'projects', projectId);
        const projectDoc = await transaction.get(projectRef);

        if (!projectDoc.exists()) {
          throw new Error('Project does not exist!');
        }

        let ticketPrefix = projectDoc.data().ticketPrefix;

        if (!ticketPrefix) {
          // This is the first user story, generate and save a prefix.
          // A more robust implementation would check for prefix uniqueness across all projects.
          ticketPrefix = generatePrefix();
          transaction.update(projectRef, { ticketPrefix });
        }
        
        const userStoriesCollectionRef = collection(firestore, 'projects', projectId, 'userStories');
        
        // The ticketId is now constructed on the client and passed in userStoryData
        transaction.set(doc(userStoriesCollectionRef), userStoryData);
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
        description: error.message || 'There was a problem adding your user story.',
      });
    }
  };

  return addUserStory;
}
