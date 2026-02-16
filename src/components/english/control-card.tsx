'use client';

import { Button } from '@/components/ui/button';
import { AccuracyCard } from './accuracy-card';

type ControlCardProps = {
  onFeedback: (quality: number) => void;
  isProcessing: boolean;
  status: {
    process: "initial" | "answer" | "feedback" | "continue";
    accuracy: number | null;
  };
  handleShowAnswer: () => void;
  nextCard: () => void;
};

export function ControlCard({
  onFeedback,
  isProcessing,
  status,
  nextCard,
  handleShowAnswer,
}: ControlCardProps) {

  if (status.process === 'feedback') {
    return (
      <div className="w-full flex justify-center py-4">
        <AccuracyCard accuracy={status.accuracy} nextCard={nextCard} />
      </div>
    );
  }

  if (status.process === 'initial') {
    return (
      <div className="w-full px-2">
        <Button 
          onClick={handleShowAnswer} 
          size="lg" 
          className="w-full h-16 text-xl font-headline tracking-tight shadow-md active:scale-[0.98] transition-all rounded-xl"
        >
          Show Answer
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 px-2">
      <p className="text-center text-xs font-semibold uppercase text-muted-foreground tracking-widest">
        How well did you remember?
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="h-20 flex-1 rounded-xl shadow-sm active:scale-[0.98] transition-all border-none"
            onClick={() => onFeedback(1)}
            disabled={isProcessing}
          >
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold font-headline uppercase">NO</span>
              <span className="text-[10px] font-normal opacity-80 mt-0.5 line-clamp-1">I forgot</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-1 rounded-xl shadow-sm active:scale-[0.98] transition-all border-2 border-muted-foreground/20 hover:bg-accent/5"
            onClick={() => onFeedback(3)}
            disabled={isProcessing}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold font-headline uppercase">Sort of</span>
              <span className="text-[10px] font-normal text-muted-foreground mt-0.5 line-clamp-1">Barely</span>
            </div>
          </Button>
        </div>
        <Button
          variant="default"
          className="h-20 w-full rounded-xl shadow-md active:scale-[0.98] transition-all border-none"
          onClick={() => onFeedback(5)}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold font-headline uppercase">YES</span>
            <span className="text-xs font-normal opacity-80 mt-0.5">I've learned it!</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
