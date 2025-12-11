'use client';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc, type DocumentData, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Project, Skill, VocabularyItem, UserProfile } from '@/lib/types';

type DocData<T> = {
  loading: boolean;
  data: T | null;
  error: Error | null;
};

export function useDoc<T extends DocumentData>(docRefPath: string | null): DocData<T> {
  const firestore = useFirestore();
  const [snapshot, setSnapshot] = useState<DocData<T>>({
    loading: true,
    data: null,
    error: null,
  });

  const docRef = useMemo(() => {
    if (!firestore || !docRefPath) return null;
    return doc(firestore, docRefPath);
  }, [firestore, docRefPath]);

  useEffect(() => {
    if (!docRef) {
      setSnapshot({ loading: false, data: null, error: null });
      return;
    }
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          setSnapshot({ loading: false, data, error: null });
        } else {
          setSnapshot({ loading: false, data: null, error: null });
        }
      },
      (error) => {
        console.error("Error fetching document:", error);
        setSnapshot({ loading: false, data: null, error });
      }
    );
    return () => unsubscribe();
  }, [docRef]);

  return snapshot;
}

// Hook to get a single project by ID
export function useProject(projectId: string | null): DocData<Project> {
  const docPath = projectId ? `projects/${projectId}` : null;
  return useDoc<Project>(docPath);
}

// Hook to get a single skill by ID
export function useSkill(skillId: string | null): DocData<Skill> {
    const docPath = skillId ? `skills/${skillId}` : null;
    return useDoc<Skill>(docPath);
}

// Hook to get a single vocabulary item by ID
export function useVocabularyItem(itemId: string | null): DocData<VocabularyItem> {
    const docPath = itemId ? `vocabulary/${itemId}` : null;
    return useDoc<VocabularyItem>(docPath);
}

// Hook to get a user profile by ID
export function useUserProfile(userId?: string | null): DocData<UserProfile> {
    const docPath = userId ? `users/${userId}` : null;
    return useDoc<UserProfile>(docPath);
}
