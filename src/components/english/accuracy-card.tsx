import { useState, useEffect } from 'react'

import { Progress } from '@/components/ui/progress';

type AccuracyCardProps = {
  accuracy: number | null;
  nextCard: () => void;
};

export const AccuracyCard = ({ accuracy, nextCard }: AccuracyCardProps) => {
  const [animate, setAnimate] = useState<number | null>(null);

  useEffect(() => {
    let timer = setTimeout(() => {
      setAnimate(accuracy);
    }, 200);

    return () => clearTimeout(timer);
  }, [accuracy]);

  useEffect(() => {
    let timer = setTimeout(() => {
      nextCard();
    }, 1200); // Slightly longer for readability

    return () => clearTimeout(timer);
  }, [nextCard])

  if (animate === null) {
    return null;
  }

  return (
    <div className="w-full px-4 space-y-3">
      <div className="flex items-center gap-4 justify-center">
        <span className="text-sm font-bold text-center uppercase tracking-wide text-muted-foreground">
          New Accuracy: {Math.round(animate * 100)}%
        </span>
      </div>
      <Progress value={animate * 100} className="h-3" />
    </div>
  );
};
