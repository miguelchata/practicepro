
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
    ipa: '/ɪˈfɛmərəl/'
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
    ipa: '/juːˈbɪkwɪtəs/'
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
    ipa: '/məˈlɪfluəs/'
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
    ipa: '/ˌpʌlkrɪˈtjuːdɪnəs/'
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
            <div className="flex items-baseline justify-between">
                <CardDescription>{wordData.type}</CardDescription>
                <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <p className="font-semibold">Definition</p>
                <p className="text-muted-foreground text-lg">{wordData.definition}</p>
            </div>
            <Separator/>
            <div>
                <p className="font-semibold">Examples</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                    {wordData.examples.map((example, index) => (
                        <li key={index} className="italic">&quot;{example}&quot;</li>
                    ))}
                </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

    