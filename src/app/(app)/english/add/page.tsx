'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useAddVocabularyItem } from '@/firebase/firestore/use-vocabulary';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  definition: z.string().min(3, 'Definition is required.'),
  ipa: z.string().optional(),
  examples: z.string().optional(),
  tags: z.string().optional(),
});

export default function AddWordPage() {
  const router = useRouter();
  const addVocabularyItem = useAddVocabularyItem();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      definition: '',
      ipa: '',
      examples: '',
      tags: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addVocabularyItem({
      word: values.word,
      definition: values.definition,
      ipa: values.ipa,
      examples: values.examples?.split('\n').filter(ex => ex.trim()) || [],
      tags: values.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    });
    router.push('/english');
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Add New Word" backButtonHref="/english" />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">New Vocabulary Item</CardTitle>
                <CardDescription>Add a new word to your practice collection.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="word"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Word</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Ephemeral" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ipa"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>IPA (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="/ɪˈfɛmərəl/" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                    control={form.control}
                    name="definition"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Definition</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Lasting for a very short time."
                            rows={3}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="examples"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Example Sentences (one per line)</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="The beauty of the cherry blossoms is ephemeral."
                            rows={4}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tags (comma-separated)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., adjective, common, new" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    
                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-5 w-5" />
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Word'}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
