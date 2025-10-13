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
import { StopCircle, Star, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

function ActiveSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const skillName = searchParams.get('skillName') || 'Practice';
  const intention = searchParams.get('intention');
  const sessionType = searchParams.get('type') || 'pomodoro';
  const customDuration = searchParams.get('duration');
  const skillId = searchParams.get('skillId');
  const subSkill = searchParams.get('subSkill');
  const goal = searchParams.get('goal');


  const getInitialTime = () => {
    switch (sessionType) {
      case 'pomodoro':
        return 25 * 60; // 25 minutes
      case 'timed':
        return customDuration ? parseInt(customDuration, 10) : 10 * 60; // Custom duration or default 10 mins
      case 'manual':
        return 0; // Starts from 0 and counts up
      default:
        return 25 * 60;
    }
  };
  
  const [startTime] = useState(Date.now());
  const [time, setTime] = useState(getInitialTime());
  const [sessionEnded, setSessionEnded] = useState(false);
  
  const isCountdown = sessionType === 'pomodoro' || sessionType === 'timed';


  useEffect(() => {
    if (sessionEnded) return;

    const timer = setInterval(() => {
      if (isCountdown) {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setSessionEnded(true);
            toast({
              title: 'Session Complete!',
              description: `Great work on your ${skillName} practice.`,
            });
            // Optionally play a sound here
            return 0;
          }
          return prevTime - 1;
        });
      } else { // Manual mode (count up)
        setTime(prevTime => prevTime + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionEnded, isCountdown, skillName, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    const durationInSeconds = isCountdown
      ? getInitialTime() - time
      : time;

    const queryParams = new URLSearchParams({
      skillId: skillId || '',
      skillName: skillName,
      duration: String(durationInSeconds),
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
              {formatTime(time)}
            </CardTitle>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-muted-foreground">
                {subSkill && <Badge variant="secondary" className="gap-1.5"><Zap className="h-3 w-3" /> {subSkill}</Badge>}
                {goal && <Badge variant="secondary" className="gap-1.5"><Target className="h-3 w-3" /> {goal}</Badge>}
            </div>
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
