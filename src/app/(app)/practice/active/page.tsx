'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StopCircle, Square, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { skills } from '@/lib/data';

function ActiveSession() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const skillName = searchParams.get('skillName') || 'Practice';
  const intention = searchParams.get('intention');

  // In a real app, the timer logic would be implemented here.
  // For now, it's a placeholder.

  const handleEndSession = () => {
    // Here you would typically navigate to a post-session summary/journaling page
    router.push('/journal');
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`${skillName} Session`} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardDescription className="font-headline text-lg">{skillName}</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tighter">
              25:00
            </CardTitle>
            {intention && (
              <p className="text-muted-foreground pt-2">
                <strong>Intention:</strong> {intention}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-4">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndSession}
                className="w-full"
              >
                <StopCircle className="mr-2" /> End Session
              </Button>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">How did it go?</p>
                <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                    <Button key={rating} variant="outline" size="icon">
                    <Star className="h-5 w-5" />
                    <span className="sr-only">Rate {rating} of 5</span>
                    </Button>
                ))}
                </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ActiveSessionPage() {
    return (
      <Suspense fallback={<div>Loading session...</div>}>
        <ActiveSession />
      </Suspense>
    );
  }