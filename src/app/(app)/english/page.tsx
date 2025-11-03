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
                    <div key={index}>
                        <div className="grid gap-1">
                            <p className="font-semibold">{item.word}</p>
                            <p className="text-sm text-muted-foreground">{item.definition}</p>
                        </div>
                        {index < vocabularyList.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
