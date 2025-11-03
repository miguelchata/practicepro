'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const vocabularyList = [
  {
    word: 'ephemeral',
    definition: 'Lasting for a very short time.',
    example: 'The beauty of the cherry blossoms is ephemeral.',
    learned: true,
  },
  {
    word: 'ubiquitous',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Smartphones have become ubiquitous in modern society.',
    learned: true,
  },
  {
    word: 'mellifluous',
    definition: 'A sound that is sweet and musical; pleasant to hear.',
    example: 'Her mellifluous voice captivated the audience.',
    learned: false,
  },
  {
    word: 'pulchritudinous',
    definition: 'Having great physical beauty.',
    example: 'The pulchritudinous landscape was breathtaking.',
    learned: false,
  },
]

export default function WordDetailPage() {
  const params = useParams()
  const word = params.word as string
  const wordData = vocabularyList.find(item => item.word === word)

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
            <CardDescription className="text-lg">{wordData.definition}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Example Sentence</h4>
                <p className="text-muted-foreground italic">&quot;{wordData.example}&quot;</p>
              </div>
              <div className="flex items-center justify-end pt-4">
                <Button>{wordData.learned ? 'Mark as Unlearned' : 'Mark as Learned'}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
