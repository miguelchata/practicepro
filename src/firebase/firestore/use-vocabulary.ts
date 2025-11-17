'use client';

import { addDoc, collection, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { VocabularyItem } from '@/lib/types';

type NewVocabularyData = Omit<VocabularyItem, 'id' | 'userId' | 'accuracy' | 'alpha' | 'repetitions' | 'lastQuality' | 'lastReviewedAt' | 'nextReviewAt' | 'createdAt' | 'updatedAt' | 'decayRate' | 'threshold' | 'consecutiveSuccesses' | 'leechCount'>;

export function useAddVocabularyItem() {
  const firestore = useFirestore();
  const { data: user } = useUser();
  const { toast } = useToast();

  const addVocabularyItem = async (itemsData: NewVocabularyData | NewVocabularyData[]) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add vocabulary items.',
      });
      return;
    }
    
    const itemsToAdd = Array.isArray(itemsData) ? itemsData : [itemsData];
    
    if (itemsToAdd.length === 0) return;

    try {
      const now = new Date().toISOString();
      const vocabCollection = collection(firestore, 'vocabulary');
      
      if (itemsToAdd.length === 1) {
          const itemData = itemsToAdd[0];
          await addDoc(vocabCollection, {
            ...itemData,
            userId: user.uid,
            accuracy: 0.0,
            alpha: 0.2,
            repetitions: 0,
            lastQuality: 0,
            lastReviewedAt: null,
            nextReviewAt: now,
            createdAt: now,
            updatedAt: now,
          });
          toast({
            title: 'Word Added!',
            description: `"${itemData.word}" has been added to your vocabulary.`,
          });
      } else {
          const batch = writeBatch(firestore);
          itemsToAdd.forEach(itemData => {
              const newDocRef = doc(vocabCollection);
              batch.set(newDocRef, {
                ...itemData,
                userId: user.uid,
                accuracy: 0.0,
                alpha: 0.2,
                repetitions: 0,
                lastQuality: 0,
                lastReviewedAt: null,
                nextReviewAt: now,
                createdAt: now,
                updatedAt: now,
              });
          });
          await batch.commit();
          toast({
            title: 'Words Added!',
            description: `${itemsToAdd.length} words have been added to your vocabulary.`,
          });
      }

    } catch (error: any) {
      console.error('Error adding vocabulary item(s):', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem adding your word(s).',
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
