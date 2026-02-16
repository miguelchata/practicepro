'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Sparkles } from 'lucide-react';
import Link from 'next/link';

type DueReviewCardProps = {
  dueCount: number;
  totalCount: number;
};

export function DueReviewCard({ dueCount, totalCount }: DueReviewCardProps) {
  if (totalCount === 0) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome to Lexio
          </CardTitle>
          <CardDescription>
            You haven't added any words to your collection yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full md:w-auto">
            <Link href="/management/add">Add Your First Word</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dueCount > 0 ? "bg-amber-50 border-amber-200" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <Timer className={`h-5 w-5 ${dueCount > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
              Daily Practice
            </CardTitle>
            <CardDescription>
              {dueCount > 0 
                ? `You have ${dueCount} words ready for review.` 
                : "Great job! You're all caught up for now."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          asChild 
          size="lg" 
          variant={dueCount > 0 ? "default" : "outline"}
          className="w-full md:w-auto"
        >
          <Link href={`/practice${dueCount > 0 ? `/session?amount=${dueCount}&type=both` : ""}`}>
            {dueCount > 0 ? "Start Review Session" : "Review Anyway"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
