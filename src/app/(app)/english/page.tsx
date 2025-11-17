
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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMemo, useState } from 'react';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EnglishPage() {
  const { data: vocabularyList, loading } = useVocabulary();
  const [practiceAmount, setPracticeAmount] = useState(10);
  const [exerciseType, setExerciseType] = useState('both');
  
  const reviewLink = `/english/practice?amount=${practiceAmount}&type=${exerciseType}`;

  const { averageAccuracy, totalCount, progressPercentage } = useMemo(() => {
    const total = vocabularyList.length;
    if (total === 0) {
      return { averageAccuracy: 0, totalCount: 0, progressPercentage: 0 };
    }
    const totalAccuracy = vocabularyList.reduce((acc, item) => acc + item.accuracy, 0);
    const avg = totalAccuracy / total;
    return {
      averageAccuracy: avg,
      totalCount: total,
      progressPercentage: avg * 100,
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
             <div className="pt-4 space-y-2">
                <Progress value={progressPercentage} />
                <p className="text-sm text-muted-foreground">
                  {totalCount} {totalCount === 1 ? 'word' : 'words'} with {Math.round(progressPercentage)}% average accuracy
                </p>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : vocabularyList.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Practice List</h3>
                <div className="space-y-4">
                    {vocabularyList.map((item, index) => (
                        <Link href={`/english/${item.word.toLowerCase()}`} key={item.id} className="block hover:bg-muted/50 rounded-lg p-4 -m-4">
                            <div>
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{item.word.charAt(0).toUpperCase() + item.word.slice(1)}</p>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {`${Math.round(item.accuracy * 100)}%`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.definition}</p>
                                </div>
                                {index < vocabularyList.length - 1 && <Separator className="mt-4" />}
                            </div>
                        </Link>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
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
