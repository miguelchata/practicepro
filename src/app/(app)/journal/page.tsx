'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, PlusCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data, in a real app this would come from Firestore
const journalEntries = [
  {
    date: 'June 18, 2024',
    skill: 'Guitar',
    duration: '25 mins',
    rating: 4,
    well: 'Felt more confident with the F bar chord.',
    difficult: 'Still buzzing on the B minor chord transition.',
    analysis: {
      patterns: 'Consistent difficulty with minor bar chords.',
      suggestions:
        'Try practicing chord transitions slowly without a metronome first, focusing on finger placement.',
    },
  },
  {
    date: 'June 17, 2024',
    skill: 'Public Speaking',
    duration: '15 mins',
    rating: 3,
    well: 'Opening was strong and engaging.',
    difficult: 'Lost my train of thought in the middle and used "um" a lot.',
    analysis: {
      patterns: 'Anxiety increases during unstructured parts of the speech.',
      suggestions:
        'Outline key points on notecards to guide you through the main body of your presentation.',
    },
  },
];

export default function JournalPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Practice Journal" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">Your Entries</h2>
            <p className="text-muted-foreground">
              Review your progress and AI-powered insights.
            </p>
          </div>
           <Button asChild>
              <Link href="/practice">
                <PlusCircle className="mr-2 h-4 w-4" /> New Session
              </Link>
            </Button>
        </div>

        {journalEntries.length === 0 ? (
           <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
              <CardTitle>No Entries Yet</CardTitle>
              <CardDescription>Start a practice session to log your first entry.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/practice">Start Your First Session</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {journalEntries.map((entry, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-headline">{entry.skill}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {entry.date} &middot; {entry.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{entry.skill}</Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < entry.rating ? 'text-accent fill-accent' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">What went well?</h4>
                    <p className="text-muted-foreground">{entry.well}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">What was difficult?</h4>
                    <p className="text-muted-foreground">{entry.difficult}</p>
                  </div>
                  <Separator />
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <h4 className="font-semibold font-headline flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Analysis
                    </h4>
                    <div>
                      <h5 className="font-semibold">Identified Patterns:</h5>
                      <p className="text-sm text-primary/90">
                        {entry.analysis.patterns}
                      </p>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-semibold">Suggestions:</h5>
                      <p className="text-sm text-primary/90">
                        {entry.analysis.suggestions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
