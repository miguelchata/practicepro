
'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { BlurredWord } from '@/components/english/blurred-word'

const vocabularyList = [
  {
    word: 'ephemeral',
    type: 'Adjective',
    definition: 'Lasting for a very short time.',
    examples: [
      'The beauty of the cherry blossoms is ephemeral.',
      'His success as a singer was ephemeral.'
    ],
    learned: true,
  },
  {
    word: 'ubiquitous',
    type: 'Adjective',
    definition: 'Present, appearing, or found everywhere.',
    examples: [
        'Smartphones have become ubiquitous in modern society.',
        'The company\'s logo is ubiquitous, appearing on everything from billboards to coffee mugs.'
    ],
    learned: true,
  },
  {
    word: 'mellifluous',
    type: 'Adjective',
    definition: 'A sound that is sweet and musical; pleasant to hear.',
    examples: [
        'Her mellifluous voice captivated the audience.',
        'The mellifluous tones of the cello filled the room.'
    ],
    learned: false,
  },
  {
    word: 'pulchritudinous',
    type: 'Adjective',
    definition: 'Having great physical beauty.',
    examples: [
        'The pulchritudinous landscape was breathtaking.',
        'She was a pulchritudinous woman who turned heads wherever she went.'
    ],
    learned: false,
  },
]

export default function WordDetailPage() {
  const params = useParams()
  const word = params.word as string
  const wordData = vocabularyList.find(item => item.word === word)
  const [showWord, setShowWord] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

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
  
  const headerTitle = showWord ? wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1) : "Guess the Word"

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={headerTitle} backButtonHref="/english" />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-baseline justify-between">
                {showWord ? (
                    <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
                ) : (
                    <div className="h-10"></div> // Placeholder for spacing
                )}
                <p className="text-sm font-medium text-muted-foreground">{wordData.type}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <p className="text-muted-foreground text-lg">{wordData.definition}</p>
            </div>
            
            {!showExamples && (
                <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => setShowExamples(true)}>Show Examples</Button>
                </div>
            )}

            {showExamples && (
                <>
                    <Separator/>
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Examples</h4>
                        <Carousel className="w-full">
                            <CarouselContent>
                                {wordData.examples.map((example, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1">
                                    <p className="text-center text-lg italic text-muted-foreground">
                                        &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={showWord} />&quot;
                                    </p>
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden sm:flex" />
                            <CarouselNext className="hidden sm:flex" />
                        </Carousel>
                    </div>
                </>
            )}

             <div className="flex items-center justify-between pt-4">
                {!showWord ? (
                    <Button onClick={() => setShowWord(true)}>Show Answer</Button>
                ) : (
                    <div></div> // Placeholder
                )}
                <Button variant="secondary">{wordData.learned ? 'Mark as Unlearned' : 'Mark as Learned'}</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
