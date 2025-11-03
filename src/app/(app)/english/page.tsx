'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function EnglishPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="English" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>English Practice</CardTitle>
            <CardDescription>
              This is your dedicated space for English practice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Content for the English page will go here. You can add components
              for vocabulary, grammar, speaking practice, and more.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
