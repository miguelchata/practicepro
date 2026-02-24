'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const user = useUser();

  useEffect(() => {
    if (user.loading) {
      return;
    }
    if (!user.data) {
      redirect('/login');
    } else {
      redirect('/dashboard');
    }
  }, [user.data, user.loading]);

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse font-headline text-lg font-semibold">
        Lexio
      </div>
=======
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="animate-pulse text-muted-foreground">Checking authentication...</p>
>>>>>>> origin/main
    </div>
  );
}
