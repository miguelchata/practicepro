'use client';

import { addDoc, collection, doc, runTransaction } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserStory } from '@/lib/types';

function numberToLetters(num: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letters = '';
  let tempNum = num;

  if (tempNum === 0) {
    return 'AA';
  }

  let firstCharIndex = Math.floor(tempNum / 26);
  let secondCharIndex = tempNum % 26;

  letters += alphabet[firstCharIndex];
  letters += alphabet[secondCharIndex];
  
  return letters;
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
          const metadataRef = doc(firestore, 'metadata', 'projectPrefixCounter');
          const metadataDoc = await transaction.get(metadataRef);
          let nextIndex = 0;
          if (metadataDoc.exists()) {
            nextIndex = metadataDoc.data().lastIndex + 1;
          }

          ticketPrefix = numberToLetters(nextIndex);
          
          transaction.update(projectRef, { ticketPrefix });

          if (metadataDoc.exists()) {
            transaction.update(metadataRef, { lastIndex: nextIndex });
          } else {
            transaction.set(metadataRef, { lastIndex: nextIndex });
          }
        }
        
        const userStoriesCollectionRef = collection(firestore, 'projects', projectId, 'userStories');
        
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
