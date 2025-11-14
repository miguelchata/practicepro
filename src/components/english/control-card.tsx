
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type ControlCardProps = {
  accuracy: number | null;
  onFeedback: (quality: number) => void;
  isProcessing: boolean;
};

export function ControlCard({ accuracy, onFeedback, isProcessing }: ControlCardProps) {
  if (accuracy !== null) {
    const progressPercent = accuracy * 100;
    return (
      <div className="w-full px-4 space-y-2">
        <div className="flex items-center gap-4 justify-center">
          <span className="text-sm font-medium text-center">
            Vocabulary progress: {Math.round(progressPercent)}%
          </span>
        </div>
        <Progress value={progressPercent} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
      <p className="text-center font-semibold">How well did you remember it?</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          variant="destructive"
          className="h-auto"
          onClick={() => onFeedback(1)}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center p-2">
            <span className="font-bold">NO</span>
            <span className="text-xs font-normal">Repeat</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto"
          onClick={() => onFeedback(3)}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center p-2">
            <span className="font-bold">Sort of</span>
            <span className="text-xs font-normal">Keep studying</span>
          </div>
        </Button>
        <Button
          variant="default"
          className="h-auto"
          onClick={() => onFeedback(5)}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center p-2">
            <span className="font-bold">YES</span>
            <span className="text-xs font-normal">I've learned</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
