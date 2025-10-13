'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Star } from 'lucide-react';
import { useState } from 'react';

function JournalForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const skillName = searchParams.get('skillName') || 'Practice';
  const duration = searchParams.get('duration');
  const skillId = searchParams.get('skillId');

  const [rating, setRating] = useState(0);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatWasDifficult, setWhatWasDifficult] = useState('');

  const formatDuration = (seconds: string | null) => {
    if (!seconds) return 'N/A';
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes} min ${secs} sec`;
  };

  const handleSaveJournal = () => {
    // In a real app, you would save this data to Firestore
    console.log({
      skillId,
      skillName,
      duration,
      rating,
      whatWentWell,
      whatWasDifficult,
    });

    toast({
      title: 'Journal Saved!',
      description: 'Your practice session has been logged.',
    });

    // Navigate to the main journal page to see all entries
    router.push('/journal');
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Log Your Session" />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Reflect on Your Practice
            </CardTitle>
            <CardDescription>
              Session: {skillName} ({formatDuration(duration)})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-base">How would you rate this session?</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={rating >= star ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setRating(star)}
                    className="h-12 w-12"
                  >
                    <Star className="h-6 w-6" />
                    <span className="sr-only">Rate {star} of 5</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="what-went-well" className="text-base">What went well?</Label>
              <Textarea
                id="what-went-well"
                placeholder="e.g., I finally nailed the chord change I was struggling with."
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="what-was-difficult" className="text-base">What was difficult?</Label>
              <Textarea
                id="what-was-difficult"
                placeholder="e.g., My timing was off when playing with the metronome."
                value={whatWasDifficult}
                onChange={(e) => setWhatWasDifficult(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={handleSaveJournal} disabled={rating === 0}>
              <Save className="mr-2 h-5 w-5" /> Save Journal Entry
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}


export default function PracticeJournalPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JournalForm />
        </Suspense>
    )
}
