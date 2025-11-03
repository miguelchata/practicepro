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
import { StopCircle, Play, Pause, Zap, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type TimerStatus = 'idle' | 'running' | 'paused';

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
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [time, setTime] = useState(getInitialTime());
  const [sessionEnded, setSessionEnded] = useState(false);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  
  const isCountdown = sessionType === 'pomodoro' || sessionType === 'timed';


  useEffect(() => {
    if (timerStatus !== 'running' || sessionEnded) return;

    const timer = setInterval(() => {
      if (isCountdown) {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setSessionEnded(true);
            setTimerStatus('idle');
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
  }, [sessionEnded, isCountdown, skillName, toast, timerStatus]);

  const handleStartPause = () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
    } else {
      if (timerStatus === 'idle') {
        setStartTime(Date.now());
      }
      setTimerStatus('running');
    }
  };

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
      startTime: String(startTime || Date.now()),
    });

    if (goal) {
        queryParams.set('goal', goal);
    }
    if (subSkill) {
        queryParams.set('subSkill', subSkill);
    }
    
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
              {timerStatus !== 'running' && (
                <Button size="lg" onClick={handleStartPause} className="w-full" variant="outline">
                    <Play className="mr-2" /> Start
                </Button>
              )}
               {timerStatus === 'running' && (
                <Button size="lg" onClick={handleStartPause} className="w-full" variant="outline">
                    <Pause className="mr-2" /> Pause
                </Button>
              )}
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndSession}
                disabled={timerStatus === 'idle'}
              >
                <StopCircle className="mr-2" /> End
              </Button>
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
