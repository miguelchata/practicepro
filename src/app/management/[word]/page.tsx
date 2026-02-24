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
import { useMemo, useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export default function WordDetailPage() {
  const params = useParams()
  // The param is now expected to be a slug (e.g., "carry-on")
  const wordParam = params.word ? (params.word as string).toLowerCase() : ''
  const { data: vocabularyList, loading } = useVocabulary();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wordData = useMemo(() => {
    if (!wordParam || !vocabularyList) return null;
    // Find the item by slugifying its stored word and comparing
    return vocabularyList.find(item => {
      const slug = item.word.toLowerCase().trim().replace(/\s+/g, '-');
      return slug === wordParam;
    });
  }, [vocabularyList, wordParam]);

  const reviewInfo = useMemo(() => {
    if (!mounted || !wordData || !wordData.nextReviewAt) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const reviewDate = new Date(wordData.nextReviewAt);
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
  }, [wordData, mounted]);

  if (loading || !mounted) {
    return (
      <AuthenticatedLayout>
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
      </AuthenticatedLayout>
    )
  }

  if (!wordData) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-screen w-full flex-col">
          <Header title="Word not found" backButtonHref="/management" />
          <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
            <p className="text-lg">The word <span className="font-bold">&quot;{wordParam.replace(/-/g, ' ')}&quot;</span> could not be found in your collection.</p>
             <Button asChild className="mt-4">
                  <a href="/management">Back to Management</a>
              </Button>
          </main>
        </div>
      </AuthenticatedLayout>
    )
  }
  
  return (
    <AuthenticatedLayout>
      <div className="flex min-h-screen w-full flex-col">
        <Header title={wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1)} backButtonHref="/management" />
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
              <div className="flex items-baseline justify-between mt-2">
                  <CardDescription className="text-primary font-semibold uppercase tracking-wider text-xs">{wordData.type || 'Vocabulary Item'}</CardDescription>
                   {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                  <p className="text-sm font-bold uppercase text-muted-foreground tracking-tight">Definition</p>
                  <p className="text-foreground text-xl leading-relaxed">{wordData.definition}</p>
              </div>
              {wordData.examples && wordData.examples.length > 0 && (
                <>
                  <Separator/>
                  <div className="space-y-4">
                      <p className="text-sm font-bold uppercase text-muted-foreground tracking-tight">Examples</p>
                      <ul className="space-y-4">
                          {wordData.examples.map((example, index) => (
                              <li key={index} className="italic text-lg text-muted-foreground border-l-4 border-primary/20 pl-4 bg-muted/30 py-2 rounded-r-md">
                                &quot;{example}&quot;
                              </li>
                          ))}
                      </ul>
                  </div>
                </>
              )}
            </CardContent>
            {reviewInfo && (
              <CardFooter className="pt-4 border-t bg-muted/20">
                  <div className={cn(
                      "flex items-center gap-2 text-sm",
                      reviewInfo.isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'
                  )}>
                      <Calendar className="h-4 w-4" />
                      <span>{reviewInfo.text}</span>
                  </div>
              </CardFooter>
            )}
          </Card>
        </main>
      </div>
    </AuthenticatedLayout>
  )
}
