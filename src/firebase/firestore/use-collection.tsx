'use client';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, query, collection, where, type Query, type DocumentData, type Firestore } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Project, UserStory, Skill } from '@/lib/types';

type CollectionData<T> = {
  loading: boolean;
  data: T[];
  error: Error | null;
};

export function useCollection<T extends DocumentData>(q: Query | null): CollectionData<T> {
  const [snapshot, setSnapshot] = useState<CollectionData<T>>({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    if (!q) {
      setSnapshot({ loading: false, data: [], error: null });
      return;
    }
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
        setSnapshot({ loading: false, data, error: null });
      },
      (error) => {
        console.error("Error fetching collection:", error);
        setSnapshot({ loading: false, data: [], error });
      }
    );
    return () => unsubscribe();
  }, [q]);

  return snapshot;
}

// Hook to get projects for the current user
export function useProjects(): CollectionData<Project> {
  const firestore = useFirestore();
  const { data: user, loading: userLoading } = useUser();

  const projectsQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'projects'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const projects = useCollection<Project>(projectsQuery);
  
  return {
    ...projects,
    loading: userLoading || projects.loading,
  };
}

// Hook to get user stories for a project
export function useUserStories(projectId: string | null): CollectionData<UserStory> {
  const firestore = useFirestore();

  const userStoriesQuery = useMemo(() => {
    if (!firestore || !projectId) return null;
    return query(collection(firestore, `projects/${projectId}/userStories`));
  }, [firestore, projectId]);

  return useCollection<UserStory>(userStoriesQuery);
}


// Hook to get user stories for a list of projects
export function useUserStoriesForProjects(projectIds: string[] | null): Record<string, UserStory[]> {
  const firestore = useFirestore();
  const [storiesByProject, setStoriesByProject] = useState<Record<string, UserStory[]>>({});

  useEffect(() => {
    if (!firestore || !projectIds || projectIds.length === 0) {
      setStoriesByProject({});
      return;
    }

    const unsubscribes = projectIds.map(projectId => {
      const storiesQuery = query(collection(firestore, `projects/${projectId}/userStories`));
      return onSnapshot(storiesQuery, (snapshot) => {
        const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserStory[];
        setStoriesByProject(prev => ({
          ...prev,
          [projectId]: stories,
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [firestore, projectIds]);

  return storiesByProject;
}


// Hook to get skills for the current user
export function useSkills(): CollectionData<Skill> {
  const firestore = useFirestore();
  const { data: user, loading: userLoading } = useUser();

  const skillsQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'skills'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const skills = useCollection<Skill>(skillsQuery);
  
  return {
    ...skills,
    loading: userLoading || skills.loading,
  };
}

    