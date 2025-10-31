'use client';

import { Suspense, useState } from 'react';
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
import { useFirestore } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';

function JournalForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const skillName = searchParams.get('skillName') || 'Practice';
  const duration = searchParams.get('duration');
  const skillId = searchParams.get('skillId');

  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatWasDifficult, setWhatWasDifficult] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formatDuration = (seconds: string | null) => {
    if (!seconds) return 'N/A';
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes} min ${secs} sec`;
  };

  const handleSaveJournal = async () => {
    if (!firestore || !skillId) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save journal entry. Skill or database connection missing.',
        });
        return;
    }
    setIsSaving(true);

    try {
        await runTransaction(firestore, async (transaction) => {
            const skillRef = doc(firestore, 'skills', skillId);
            const skillDoc = await transaction.get(skillRef);

            if (!skillDoc.exists()) {
                throw new Error("Skill document not found!");
            }

            const sessionsRef = doc(collection(skillRef, 'practiceSessions'));
            const durationInSeconds = parseInt(duration || '0', 10);
            
            const newSession = {
                skillId: skillId,
                date: new Date().toISOString(),
                duration: durationInSeconds,
                whatWentWell: whatWentWell,
                whatWasDifficult: whatWasDifficult,
            };

            transaction.set(sessionsRef, newSession);

            const currentTotalHours = skillDoc.data().totalHours || 0;
            const newTotalHours = currentTotalHours + (durationInSeconds / 3600);
            transaction.update(skillRef, { totalHours: newTotalHours });
        });

        toast({
            title: 'Journal Saved!',
            description: 'Your practice session has been logged.',
        });

        router.push('/journal');

    } catch (error: any) {
        console.error("Error saving journal entry: ", error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error.message || 'There was a problem saving your journal entry.',
        });
    } finally {
        setIsSaving(false);
    }
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
            <Button size="lg" className="w-full" onClick={handleSaveJournal} disabled={isSaving}>
              <Save className="mr-2 h-5 w-5" /> 
              {isSaving ? 'Saving...' : 'Save Journal Entry'}
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
