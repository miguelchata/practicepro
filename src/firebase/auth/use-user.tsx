'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider';

type UserState = {
  loading: boolean;
  data: User | null;
  error: Error | null;
};

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<UserState>({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      // Still initializing
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser({ loading: false, data: user, error: null });
      },
      (error) => {
        setUser({ loading: false, data: null, error });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return user;
}
