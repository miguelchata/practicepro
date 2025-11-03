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
import { useState } from 'react';

const vocabularyList = [
    { word: 'ephemeral', type: 'Adjective', definition: 'Lasting for a very short time.', learned: true },
    { word: 'ubiquitous', type: 'Adjective', definition: 'Present, appearing, or found everywhere.', learned: true },
    { word: 'mellifluous', type: 'Adjective', definition: 'A sound that is sweet and musical; pleasant to hear.', learned: false },
    { word: 'pulchritudinous', type: 'Adjective', definition: 'Having great physical beauty.', learned: false },
];

const learnedCount = vocabularyList.filter(item => item.learned).length;
const totalCount = vocabularyList.length;
const progressPercentage = (learnedCount / totalCount) * 100;


export default function EnglishPage() {
  const [practiceAmount, setPracticeAmount] = useState(10);
  const firstUnlearnedWord = vocabularyList.find(item => !item.learned);
  const reviewLink = firstUnlearnedWord ? `/english/${firstUnlearnedWord.word.toLowerCase()}` : `/english/${vocabularyList[0].word.toLowerCase()}`;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="English" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>My Vocabulary</CardTitle>
            <CardDescription>Your personal word collection.</CardDescription>
             <div className="pt-4 space-y-2">
                <Progress value={progressPercentage} />
                <p className="text-sm text-muted-foreground">{learnedCount} of {totalCount} words learned</p>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Practice List</h3>
            <div className="space-y-4">
                {vocabularyList.map((item, index) => (
                    <Link href={`/english/${item.word.toLowerCase()}`} key={index} className="block hover:bg-muted/50 rounded-lg p-4 -m-4">
                        <div>
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold">{item.word.charAt(0).toUpperCase() + item.word.slice(1)}</p>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {item.learned ? '100%' : '0%'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.definition}</p>
                            </div>
                            {index < vocabularyList.length - 1 && <Separator className="mt-4" />}
                        </div>
                    </Link>
                ))}
            </div>
          </CardContent>
           <CardFooter>
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
                    <Input id="amount" type="number" value={practiceAmount} onChange={(e) => setPracticeAmount(Number(e.target.value))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Exercise Type</Label>
                    <RadioGroup defaultValue="both" className="flex gap-4">
                        <div>
                            <RadioGroupItem value="both" id="r1" className="peer sr-only" />
                            <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                Both
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="flashcards" id="r2" className="peer sr-only" />
                            <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                Flashcards only
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="writing" id="r3" className="peer sr-only" />
                            <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                Writing only
                            </Label>
                        </div>
                    </RadioGroup>
                  </div>
                </div>
                <Button asChild className="w-full">
                    <Link href={reviewLink}>
                        Practice {practiceAmount} Words
                    </Link>
                </Button>
              </DialogContent>
            </Dialog>
           </CardFooter>
        </Card>
      </main>
    </div>
  );
}
