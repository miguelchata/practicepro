'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMemo, useState } from 'react';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { Star, Check, Sparkles } from 'lucide-react';

export default function PracticePage() {
  const { data: vocabularyList, loading } = useVocabulary();
  const [practiceAmount, setPracticeAmount] = useState(10);
  const [exerciseType, setExerciseType] = useState('both');
  
  const reviewLink = `/practice/session?amount=${practiceAmount}&type=${exerciseType}`;

  const { masteredCount, learningCount, newCount, totalCount } = useMemo(() => {
    const total = vocabularyList.length;
    if (total === 0) {
      return { masteredCount: 0, learningCount: 0, newCount: 0, totalCount: 0 };
    }
    let mastered = 0;
    let learning = 0;
    let newWords = 0;

    vocabularyList.forEach(item => {
        if (item.repetitions === 0) {
            newWords++;
        } else if (item.accuracy === 1) {
            mastered++;
        } else {
            learning++;
        }
    });

    return {
      masteredCount: mastered,
      learningCount: learning,
      newCount: newWords,
      totalCount: total,
    };
  }, [vocabularyList]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Practice" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="max-w-4xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Vocabulary Review</CardTitle>
            <CardDescription>Master your personal word collection through focused review sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-green-700 font-semibold p-4 rounded-xl bg-green-500/10 min-w-[120px] justify-center">
                        <Star className="h-6 w-6" />
                        <span className="text-2xl">{masteredCount}</span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Mastered</span>
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-yellow-700 font-semibold p-4 rounded-xl bg-yellow-500/10 min-w-[120px] justify-center">
                        <Check className="h-6 w-6" />
                        <span className="text-2xl">{learningCount}</span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Learning</span>
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-sky-700 font-semibold p-4 rounded-xl bg-sky-500/10 min-w-[120px] justify-center">
                        <Sparkles className="h-6 w-6" />
                        <span className="text-2xl">{newCount}</span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">New</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-muted-foreground">
                    Total words in collection: <span className="text-foreground font-bold">{totalCount}</span>
                </p>
            </div>
          </CardContent>
           <CardFooter className="flex justify-center pb-12">
            {vocabularyList.length > 0 ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="px-12 h-14 text-lg">
                        Start Review Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Session</DialogTitle>
                      <DialogDescription>
                        Set up your practice session parameters.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount of words</Label>
                        <Input id="amount" type="number" value={practiceAmount} onChange={(e) => setPracticeAmount(Number(e.target.value))} max={totalCount}/>
                      </div>
                      <div className="grid gap-2">
                        <Label>Exercise Type</Label>
                        <RadioGroup value={exerciseType} onValueChange={setExerciseType} className="flex gap-4">
                            <div className="flex-1">
                                <RadioGroupItem value="both" id="r1" className="peer sr-only" />
                                <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center">
                                    Both
                                </Label>
                            </div>
                            <div className="flex-1">
                                <RadioGroupItem value="flashcards" id="r2" className="peer sr-only" />
                                <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center">
                                    Flashcards
                                </Label>
                            </div>
                            <div className="flex-1">
                                <RadioGroupItem value="writing" id="r3" className="peer sr-only" />
                                <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center">
                                    Writing
                                </Label>
                            </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                        <Link href={reviewLink}>
                            Practice {Math.min(practiceAmount, totalCount)} Words
                        </Link>
                    </Button>
                  </DialogContent>
                </Dialog>
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground italic">Add some words to your collection first.</p>
                    <Button asChild variant="outline">
                        <Link href="/management/add">Go to Management</Link>
                    </Button>
                </div>
            )}
           </CardFooter>
        </Card>
      </main>
    </div>
  );
}
