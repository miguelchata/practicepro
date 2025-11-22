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
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      nextCard();
    }, 800);

    return () => clearTimeout(timer);
  }, [nextCard])

  console.log(animate, " animate...");
  if (!animate) {
    return null;
  }

  return (
    <div className="w-full px-4 space-y-2">
      <div className="flex items-center gap-4 justify-center">
        <span className="text-sm font-medium text-center">
          Vocabulary progress: {Math.round(animate * 100)}%
        </span>
      </div>
      <Progress value={animate * 100} />
    </div>
  );
};