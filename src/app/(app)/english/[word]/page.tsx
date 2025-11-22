
'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useVocabulary } from '@/firebase/firestore/use-collection'
import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function WordDetailPage() {
  const params = useParams()
  const wordParam = params.word as string
  const { data: vocabularyList, loading } = useVocabulary();

  const wordData = useMemo(() => {
    return vocabularyList.find(item => item.word.toLowerCase() === wordParam.toLowerCase());
  }, [vocabularyList, wordParam]);

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col">
        <Header title="Loading..." backButtonHref="/english" />
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
            </Card>
        </main>
      </div>
    )
  }

  if (!wordData) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Word not found" backButtonHref="/english" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
          <p>The word you are looking for could not be found.</p>
           <Button asChild>
                <a href="/english">Back to Vocabulary</a>
            </Button>
        </main>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1)} backButtonHref="/english" />
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
        </Card>
      </main>
    </div>
  )
}
