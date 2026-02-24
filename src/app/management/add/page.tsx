'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Sparkles, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { useAddVocabularyItem } from '@/firebase/firestore/use-vocabulary';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import type { VocabularyItem } from '@/lib/types';
import { defineWord, type DefineWordOutput } from '@/ai/flows/define-word';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';


const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  definition: z.string().min(3, 'Definition is required.'),
  ipa: z.string().optional(),
  examples: z.string().optional(),
  type: z.string().optional(),
});

const vocabObjectSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  definition: z.string().min(3, 'Definition is required.'),
  ipa: z.string().optional(),
  examples: z.array(z.string()).optional(),
  type: z.string().optional(),
});

const jsonSchema = z.union([
    vocabObjectSchema,
    z.array(vocabObjectSchema)
]);

type NewVocabularyData = Omit<VocabularyItem, 'id' | 'userId' | 'accuracy' | 'alpha' | 'repetitions' | 'lastQuality' | 'lastReviewedAt' | 'nextReviewAt' | 'createdAt' | 'updatedAt' | 'decayRate' | 'threshold' | 'consecutiveSuccesses' | 'leechCount'>;


export default function AddWordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const addVocabularyItem = useAddVocabularyItem();
  const { data: vocabularyList } = useVocabulary();
  
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ai');
  
  // AI related state
  const [aiWord, setAiWord] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<DefineWordOutput | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      definition: '',
      ipa: '',
      examples: '',
      type: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addVocabularyItem({
      word: values.word,
      definition: values.definition,
      ipa: values.ipa,
      examples: values.examples?.split('\n').filter(ex => ex.trim()) || [],
      type: values.type || '',
    });
    router.push('/management');
  };

  const handleJsonSubmit = async () => {
    setJsonError(null);
    if (!jsonInput.trim()) {
        setJsonError('JSON input cannot be empty.');
        return;
    }

    try {
        const parsedJson = JSON.parse(jsonInput);
        const validationResult = jsonSchema.safeParse(parsedJson);

        if (!validationResult.success) {
            setJsonError(validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
            return;
        }
        
        const data = Array.isArray(validationResult.data) ? validationResult.data : [validationResult.data];

        const itemsToSave: NewVocabularyData[] = data.map(item => ({
            word: item.word,
            definition: item.definition,
            ipa: item.ipa,
            examples: item.examples || [],
            type: item.type || ''
        }));

        await addVocabularyItem(itemsToSave);
        router.push('/management');

    } catch (error) {
        setJsonError('Invalid JSON format.');
    }
  };

  const handleAiDefine = async () => {
    if (!aiWord.trim()) return;
    setIsAiLoading(true);
    setAiSuggestions(null);
    try {
      const result = await defineWord({ word: aiWord });
      setAiSuggestions(result);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AI Magic Failed',
        description: 'Could not identify word senses. Please try again or fill the form manually.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectSense = (sense: DefineWordOutput['senses'][0]) => {
    form.reset({
      word: aiSuggestions?.word || aiWord,
      definition: sense.definition,
      ipa: sense.ipa || '',
      examples: sense.examples.join('\n'),
      type: sense.type,
    });
    setActiveTab('form');
    setAiSuggestions(null);
    setAiWord('');
  };

  const isSenseExisting = (type: string) => {
    return vocabularyList.some(item => 
      item.word.toLowerCase() === (aiSuggestions?.word || aiWord).toLowerCase() && 
      item.type.toLowerCase() === type.toLowerCase()
    );
  };


  return (
    <AuthenticatedLayout>
      <div className="flex min-h-screen w-full flex-col">
        <Header title="Add New Word" backButtonHref="/management" />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
              <CardHeader>
                  <CardTitle className="font-headline text-2xl">New Vocabulary Item</CardTitle>
                  <CardDescription>Add a new word to your practice collection.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                      <TabsTrigger value="ai" className="gap-2">
                        <Sparkles className="h-4 w-4" /> AI Magic
                      </TabsTrigger>
                      <TabsTrigger value="form">Form</TabsTrigger>
                      <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ai" className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="ai-word">Which word would you like to add?</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="ai-word" 
                            placeholder="e.g., Record" 
                            value={aiWord}
                            onChange={(e) => setAiWord(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiDefine()}
                          />
                          <Button 
                            onClick={handleAiDefine} 
                            disabled={isAiLoading || !aiWord.trim()}
                            className="shrink-0"
                          >
                            {isAiLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Lookup
                          </Button>
                        </div>
                      </div>

                      {aiSuggestions && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                          <Label>Select the meaning you want to practice:</Label>
                          <div className="grid gap-3">
                            {aiSuggestions.senses.map((sense, index) => {
                              const exists = isSenseExisting(sense.type);
                              return (
                                <button
                                  key={index}
                                  onClick={() => !exists && handleSelectSense(sense)}
                                  disabled={exists}
                                  className={cn(
                                    "flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all",
                                    exists 
                                      ? "bg-muted border-muted opacity-60 cursor-not-allowed" 
                                      : "bg-background border-border hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                                  )}
                                >
                                  <div className="flex w-full items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                      {sense.type}
                                    </span>
                                    {exists ? (
                                      <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase">
                                        <CheckCircle2 className="h-3 w-3" />
                                        In Collection
                                      </span>
                                    ) : (
                                      <Plus className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  <p className="text-sm font-medium line-clamp-2">
                                    {sense.definition}
                                  </p>
                                  {sense.ipa && (
                                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                      {sense.ipa}
                                    </p>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="form" className="pt-6">
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., adjective, verb, noun" {...field} />
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
                  </TabsContent>
                  
                  <TabsContent value="json" className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="json-input">Vocabulary JSON (Single Object or Array)</Label>
                            <Textarea
                                id="json-input"
                                placeholder={`{\n  "word": "Ephemeral",\n  "definition": "Lasting for a very short time.",\n  "ipa": "/ɪˈfɛmərəl/",\n  "examples": ["The beauty of the cherry blossoms is ephemeral."],\n  "type": "adjective"\n}`}
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                rows={10}
                                className="font-mono bg-muted/50"
                            />
                            {jsonError && <p className="text-sm font-medium text-destructive">{jsonError}</p>}
                        </div>
                        <Button onClick={handleJsonSubmit} size="lg" className="w-full">
                            <Save className="mr-2 h-5 w-5" />
                            Save from JSON
                        </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
          </Card>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
