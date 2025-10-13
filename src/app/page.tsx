'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const user = useUser();

  useEffect(() => {
    if (user.data === null && !user.loading) {
      redirect('/login');
    } else if(user.data) {
      redirect('/onboarding');
    }
  }, [user.data, user.loading]);

  return null;
}
