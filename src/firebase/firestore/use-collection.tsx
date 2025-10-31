'use client';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, query, collection, where, type Query, type DocumentData, type Firestore, collectionGroup } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Project, UserStory, Skill, Task, PracticeSession } from '@/lib/types';

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

// Hook to get tasks for a project
export function useTasks(projectId: string | null): CollectionData<Task> {
    const firestore = useFirestore();

    const tasksQuery = useMemo(() => {
        if (!firestore || !projectId) return null;
        return query(collection(firestore, `projects/${projectId}/tasks`));
    }, [firestore, projectId]);

    return useCollection<Task>(tasksQuery);
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

// Hook to get all practice sessions for the current user
export function usePracticeSessions(): CollectionData<PracticeSession> {
    const firestore = useFirestore();
    const { data: user, loading: userLoading } = useUser();

    const sessionsQuery = useMemo(() => {
        if (!firestore || !user?.uid) return null;
        return query(collectionGroup(firestore, 'practiceSessions'));
    }, [firestore, user?.uid]);
    
    const sessions = useCollection<PracticeSession>(sessionsQuery);

    // This is a client-side filter because collectionGroup queries can't be filtered by parent doc fields.
    const userSessions = useMemo(() => {
        return sessions.data.filter(session => session.skillId && session.skillId.startsWith(user?.uid || ''));
    }, [sessions.data, user?.uid]);


    const { data: skills, loading: skillsLoading } = useSkills();

    const enrichedSessions = useMemo(() => {
        if (skillsLoading || sessions.loading) return [];
        
        return sessions.data.map(session => {
            const skill = skills.find(s => s.id === session.skillId);
            return {
                ...session,
                skillName: skill ? skill.name : 'Unknown Skill'
            }
        });

    }, [sessions.data, skills, skillsLoading, sessions.loading]);


    return {
        ...sessions,
        loading: userLoading || sessions.loading,
        data: enrichedSessions,
    };
}
