'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useVocabulary } from '@/firebase/firestore/use-collection'
import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WordDetailPage() {
  const params = useParams()
  const wordParam = params.word as string
  const { data: vocabularyList, loading } = useVocabulary();

  const wordData = useMemo(() => {
    return vocabularyList.find(item => item.word.toLowerCase() === wordParam.toLowerCase());
  }, [vocabularyList, wordParam]);

  const formatNextReviewDate = (nextReviewAt: string) => {
    const now = new Date();
    // Set time to 0 to compare dates only
    now.setHours(0, 0, 0, 0);
    const reviewDate = new Date(nextReviewAt);
    reviewDate.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        text: `${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue. Practice required.`,
        isOverdue: true
      };
    }
    if (diffDays === 0) {
      return { text: 'Practice today!', isOverdue: true };
    }
    return { text: `Practice again in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}.`, isOverdue: false };
  };

  const reviewInfo = wordData ? formatNextReviewDate(wordData.nextReviewAt) : null;

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col">
        <Header title="Loading..." backButtonHref="/management" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-6 w-1/2" />
              </CardFooter>
            </Card>
        </main>
      </div>
    )
  }

  if (!wordData) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Word not found" backButtonHref="/management" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
          <p>The word you are looking for could not be found.</p>
           <Button asChild>
                <a href="/management">Back to Management</a>
            </Button>
        </main>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1)} backButtonHref="/management" />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
            <div className="flex items-baseline justify-between">
                <CardDescription>{wordData.type ? wordData.type.charAt(0).toUpperCase() + wordData.type.slice(1) : 'Vocabulary Item'}</CardDescription>
                 {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <p className="font-semibold">Definition</p>
                <p className="text-muted-foreground text-lg">{wordData.definition}</p>
            </div>
            {wordData.examples && wordData.examples.length > 0 && (
              <>
                <Separator/>
                <div>
                    <p className="font-semibold">Examples</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                        {wordData.examples.map((example, index) => (
                            <li key={index} className="italic">&quot;{example}&quot;</li>
                        ))}
                    </ul>
                </div>
              </>
            )}
          </CardContent>
          {reviewInfo && (
            <CardFooter>
                <div className={cn(
                    "flex items-center gap-2 text-sm",
                    reviewInfo.isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'
                )}>
                    <Calendar className="h-4 w-4" />
                    <span>{reviewInfo.text}</span>
                </div>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  )
}
