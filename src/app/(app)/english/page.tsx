'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const vocabularyList = [
    { word: 'Ephemeral', definition: 'Lasting for a very short time.', learned: true },
    { word: 'Ubiquitous', definition: 'Present, appearing, or found everywhere.', learned: true },
    { word: 'Mellifluous', definition: 'A sound that is sweet and musical; pleasant to hear.', learned: false },
    { word: 'Pulchritudinous', definition: 'Having great physical beauty.', learned: false },
];

const learnedCount = vocabularyList.filter(item => item.learned).length;
const totalCount = vocabularyList.length;
const progressPercentage = (learnedCount / totalCount) * 100;


export default function EnglishPage() {
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
                                    <p className="font-semibold">{item.word}</p>
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
        </Card>
      </main>
    </div>
  );
}
