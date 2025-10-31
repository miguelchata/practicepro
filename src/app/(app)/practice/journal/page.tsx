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
import { Save } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Skill } from '@/lib/types';

function JournalForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const skillName = searchParams.get('skillName') || 'Practice';
  const duration = searchParams.get('duration');
  const skillId = searchParams.get('skillId');
  const goalTitle = searchParams.get('goal');
  const subSkillName = searchParams.get('subSkill');
  const startTime = searchParams.get('startTime');

  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formatDuration = (seconds: string | null) => {
    if (!seconds) return 'N/A';
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes} min ${secs} sec`;
  };

  const handleSaveJournal = async () => {
    if (!firestore || !skillId || !goalTitle || !subSkillName || !startTime) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save journal entry. Required information is missing.',
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
            
            const skillData = skillDoc.data() as Skill;
            const durationInSeconds = parseInt(duration || '0', 10);
            
            const startDate = new Date(parseInt(startTime, 10));
            const endDate = new Date();
            const year = startDate.getFullYear();
            const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
            const day = startDate.getDate().toString().padStart(2, '0');
            const localDateString = `${year}-${month}-${day}`;

            // --- Find and update the goal with the new log ---
            let newSubSkills = [...skillData.subSkills];
            const subSkillIndex = newSubSkills.findIndex(sub => sub.name === subSkillName);
            if (subSkillIndex !== -1) {
                const goalIndex = newSubSkills[subSkillIndex].goals.findIndex(g => g.specific === goalTitle);
                if (goalIndex !== -1) {
                    // Update the goal directly
                    newSubSkills[subSkillIndex].goals[goalIndex] = {
                        ...newSubSkills[subSkillIndex].goals[goalIndex],
                        status: 'Completed',
                        lastPracticeDate: localDateString,
                        lastPracticeDuration: durationInSeconds,
                        lastPracticeFeedback: feedback,
                        lastPracticeStartTime: startDate.toTimeString().split(' ')[0],
                        lastPracticeEndTime: endDate.toTimeString().split(' ')[0],
                    };
                }
            }

            // --- Update skill total hours ---
            const currentTotalHours = skillData.totalHours || 0;
            const newTotalHours = currentTotalHours + (durationInSeconds / 3600);
            
            transaction.update(skillRef, { 
                totalHours: newTotalHours,
                subSkills: newSubSkills
            });
        });

        toast({
            title: 'Journal Saved!',
            description: 'Your practice session has been logged and your goal updated.',
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
              {goalTitle && <span className="block mt-1">Goal: {goalTitle}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-base">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="e.g., I finally nailed the chord change I was struggling with, but my timing was off."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
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
