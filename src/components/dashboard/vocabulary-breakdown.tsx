'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type VocabularyBreakdownProps = {
  mastered: number;
  learning: number;
  newWords: number;
  loading: boolean;
};

export function VocabularyBreakdown({ mastered, learning, newWords, loading }: VocabularyBreakdownProps) {
  const total = mastered + learning + newWords;
  
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const items = [
    { label: 'Mastered', value: mastered, color: 'bg-green-500', percentage: total > 0 ? (mastered / total) * 100 : 0 },
    { label: 'Learning', value: learning, color: 'bg-amber-500', percentage: total > 0 ? (learning / total) * 100 : 0 },
    { label: 'New', value: newWords, color: 'bg-blue-500', percentage: total > 0 ? (newWords / total) * 100 : 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Mastery Breakdown</CardTitle>
        <CardDescription>Current status of your word collection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 italic">No data available yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.value} words</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500`} 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
