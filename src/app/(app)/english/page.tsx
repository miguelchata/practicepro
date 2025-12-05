
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
import { PlusCircle, Star, Check, Sparkles } from 'lucide-react';
import { VocabularyList } from '@/components/english/vocabulary-list';

export default function EnglishPage() {
  const { data: vocabularyList, loading } = useVocabulary();
  const [practiceAmount, setPracticeAmount] = useState(10);
  const [exerciseType, setExerciseType] = useState('both');
  
  const reviewLink = `/english/practice?amount=${practiceAmount}&type=${exerciseType}`;

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
      <Header title="English" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Vocabulary</CardTitle>
                <CardDescription>Your personal word collection.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/english/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Word
                </Link>
              </Button>
            </div>
             <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <Star className="h-6 w-6 text-green-700" />
                        <div className="text-2xl font-bold text-green-800">{masteredCount}</div>
                    </CardContent>
                </Card>
                 <Card className="bg-yellow-500/10 border-yellow-500/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <Check className="h-6 w-6 text-yellow-700" />
                        <div className="text-2xl font-bold text-yellow-800">{learningCount}</div>
                    </CardContent>
                </Card>
                 <Card className="bg-sky-500/10 border-sky-500/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <Sparkles className="h-6 w-6 text-sky-700" />
                        <div className="text-2xl font-bold text-sky-800">{newCount}</div>
                    </CardContent>
                </Card>
            </div>
          </CardHeader>
          <CardContent>
            {vocabularyList.length > 0 && <h3 className="mb-4 text-lg font-semibold">Practice List</h3>}
            <VocabularyList items={vocabularyList} loading={loading} />
            {!loading && vocabularyList.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No words in your vocabulary yet.</p>
                 <Button asChild className="mt-4">
                  <Link href="/english/add">Add your first word</Link>
                </Button>
              </div>
            )}
          </CardContent>
           <CardFooter>
            {vocabularyList.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                        Start Vocabulary Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Vocabulary Review</DialogTitle>
                      <DialogDescription>
                        Configure your practice session.
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
                            <div>
                                <RadioGroupItem value="both" id="r1" className="peer sr-only" />
                                <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Both
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="flashcards" id="r2" className="peer sr-only" />
                                <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Flashcards
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="writing" id="r3" className="peer sr-only" />
                                <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
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
            )}
           </CardFooter>
        </Card>
      </main>
    </div>
  );
}
