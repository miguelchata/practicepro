'use client';

import { Suspense, useState, useEffect } from 'react';
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
import { StopCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function ActiveSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const skillName = searchParams.get('skillName') || 'Practice';
  const intention = searchParams.get('intention');
  const sessionType = searchParams.get('type') || 'pomodoro';
  const skillId = searchParams.get('skillId');

  // Pomodoro: 25 minutes = 1500 seconds
  const initialTime = sessionType === 'pomodoro' ? 1500 : 0; 
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [sessionEnded, setSessionEnded] = useState(false);


  useEffect(() => {
    if (sessionType !== 'manual' && timeRemaining > 0 && !sessionEnded) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !sessionEnded && sessionType !== 'manual') {
      setSessionEnded(true);
      toast({
        title: 'Session Complete!',
        description: `Great work on your ${skillName} practice.`,
      });
      // Optionally play a sound here
    }
  }, [timeRemaining, sessionEnded, sessionType, skillName, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    const queryParams = new URLSearchParams({
      skillId: skillId || '',
      skillName: skillName,
      duration: String(initialTime - timeRemaining),
    });
    router.push(`/practice/journal?${queryParams.toString()}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`${skillName} Session`} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardDescription className="font-headline text-lg">{skillName}</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tighter font-mono">
              {formatTime(timeRemaining)}
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
                <StopCircle className="mr-2" /> End & Journal
              </Button>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">How did it go? (Rate after)</p>
                <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                    <Button key={rating} variant="outline" size="icon" disabled>
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
