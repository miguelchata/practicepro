'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, ArrowLeft, Flame } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

type HeaderProps = {
  title: string;
  backButtonHref?: string;
};

export function Header({ title, backButtonHref }: HeaderProps) {
  const { data: user } = useUser();
  const { data: userProfile } = useUserProfile(user?.uid);
  const auth = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'LX';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const streakInfo = useMemo(() => {
    if (!mounted || !userProfile) return { count: 0, isPracticedToday: false };

    const streak = userProfile?.currentStreak || 0;
    const lastDate = userProfile?.lastPracticeDate;
    
    if (!lastDate) return { count: 0, isPracticedToday: false };

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (lastDate === todayStr) {
      return { count: streak, isPracticedToday: true };
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      return { count: streak, isPracticedToday: false };
    }

    return { count: 0, isPracticedToday: false };
  }, [userProfile, mounted]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      {backButtonHref && (
        <Button variant="outline" size="icon" asChild className="hidden md:flex">
          <Link href={backButtonHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <h1 className="flex-1 font-headline text-lg font-semibold md:text-xl">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1.5 text-sm font-semibold text-primary">
            <Flame className={cn("h-4 w-4 transition-colors", streakInfo.isPracticedToday ? "text-orange-500 fill-orange-500" : "text-muted-foreground")} />
            <span>{streakInfo.count}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://picsum.photos/seed/${user?.uid || 'default'}/100/100`}
                  alt="User Avatar"
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || 'No email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <LogOut className="mr-2" />
                  <span>Log in</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
