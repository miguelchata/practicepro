'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const user = useUser();

  useEffect(() => {
    if (user.loading) {
      // Wait until user status is resolved
      return;
    }
    if (!user.data) {
      redirect('/login');
    } else {
      // Assuming that if a user exists, they have completed onboarding.
      // A more robust solution would check if onboarding is complete from user profile data.
      redirect('/dashboard');
    }
  }, [user.data, user.loading]);

  return null; // Or a loading spinner
}
