'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { PlusCircle } from 'lucide-react';
import { VocabularyList } from '@/components/english/vocabulary-list';

export default function ManagementPage() {
  const { data: vocabularyList, loading } = useVocabulary();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Management" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">
              Vocabulary Management
            </h2>
            <p className="text-muted-foreground">
              Add, edit, or remove words from your practice collection.
            </p>
          </div>
          <Button asChild>
            <Link href="/management/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Word
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Word Collection</CardTitle>
            <CardDescription>All your vocabulary items and their current mastery levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <VocabularyList items={vocabularyList} loading={loading} />
            {!loading && vocabularyList.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No words in your vocabulary yet.</p>
                 <Button asChild className="mt-4">
                  <Link href="/management/add">Add your first word</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
