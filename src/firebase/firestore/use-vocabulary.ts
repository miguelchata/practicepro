'use client';

import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { VocabularyItem } from '@/lib/types';

type NewVocabularyData = Omit<VocabularyItem, 'id' | 'userId' | 'accuracy' | 'alpha' | 'repetitions' | 'lastQuality' | 'lastReviewedAt' | 'status' | 'nextReviewAt' | 'createdAt' | 'updatedAt'>;

export function useAddVocabularyItem() {
  const firestore = useFirestore();
  const { data: user } = useUser();
  const { toast } = useToast();

  const addVocabularyItem = async (itemData: NewVocabularyData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a vocabulary item.',
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      await addDoc(collection(firestore, 'vocabulary'), {
        ...itemData,
        userId: user.uid,
        accuracy: 0.0,
        alpha: 0.2,
        repetitions: 0,
        lastQuality: 0,
        lastReviewedAt: null,
        status: 'learning',
        nextReviewAt: now, // Ready for review immediately
        createdAt: now,
        updatedAt: now,
      });

      toast({
        title: 'Word Added!',
        description: `"${itemData.word}" has been added to your vocabulary.`,
      });
    } catch (error: any) {
      console.error('Error adding vocabulary item:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem adding your word.',
      });
    }
  };

  return addVocabularyItem;
}


export function useUpdateVocabularyItem() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const updateVocabularyItem = async (itemId: string, itemData: Partial<VocabularyItem>) => {
    if (!firestore) {
      // Silently fail, as this is often called in the background
      console.error('Firestore not available for vocabulary update.');
      return;
    }

    try {
      const itemRef = doc(firestore, 'vocabulary', itemId);
      await updateDoc(itemRef, {
        ...itemData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error updating vocabulary item:', error);
      // Optionally show a toast for critical failures
    }
  };

  return updateVocabularyItem;
}
